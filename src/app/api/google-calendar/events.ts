import { eq } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import { calendar_v3, google } from 'googleapis';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { db } from '@/src/db';
import { therapists, bookingSessions } from '@/src/db/schema';

// Validation schema for creating a calendar event
const CreateCalendarEventSchema = z.object({
  bookingSessionId: z.number(),
});

// Refresh access token if expired
async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update the access token in the database
    await db
      .update(therapists)
      .set({
        googleCalendarAccessToken: credentials.access_token,
        updatedAt: new Date(),
      })
      .where(eq(therapists.googleCalendarRefreshToken, refreshToken));

    return credentials.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Failed to refresh access token');
  }
}

// Create Google Calendar event
async function createGoogleCalendarEvent(
  oauth2Client: OAuth2Client,
  bookingSession: {
    sessionStartTime: Date;
    therapist: {
      googleCalendarEmail: string | null;
    };
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  },
): Promise<calendar_v3.Schema$Event> {
  const calendarService = google.calendar({ version: 'v3', auth: oauth2Client });

  // Convert session times to DateTime
  const sessionStart = DateTime.fromJSDate(bookingSession.sessionStartTime);
  const sessionEnd = sessionStart.plus({ hours: 1 }); // Default 1-hour session

  const event = await calendarService.events.insert({
    calendarId: 'primary', // Use primary calendar
    requestBody: {
      summary:
        `Financial Therapy Session with ${bookingSession.user.firstName || ''} ${bookingSession.user.lastName || ''}`.trim(),
      description: 'Renavest Financial Therapy Session',
      start: {
        dateTime: sessionStart.toISO(),
        timeZone: 'UTC', // Use UTC for consistency
      },
      end: {
        dateTime: sessionEnd.toISO(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: bookingSession.therapist.googleCalendarEmail || '' },
        { email: bookingSession.user.email },
      ],
    },
  });

  return event.data;
}

// Fetch booking session details
async function fetchBookingSessionDetails(bookingSessionId: number) {
  return db.query.bookingSessions.findFirst({
    where: eq(bookingSessions.id, bookingSessionId),
    with: {
      therapist: {
        columns: {
          googleCalendarAccessToken: true,
          googleCalendarRefreshToken: true,
          googleCalendarEmail: true,
          googleCalendarIntegrationStatus: true,
        },
      },
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

// Update booking session metadata
async function updateBookingSessionMetadata(
  bookingSessionId: number,
  eventId: string,
  eventLink: string,
) {
  return db
    .update(bookingSessions)
    .set({
      metadata: {
        googleCalendarEventId: eventId,
        googleCalendarEventLink: eventLink,
      },
    })
    .where(eq(bookingSessions.id, bookingSessionId));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Validate request body
    const { bookingSessionId } = CreateCalendarEventSchema.parse(req.body);

    // Fetch booking session details
    const bookingSession = await fetchBookingSessionDetails(bookingSessionId);

    if (!bookingSession) {
      return res.status(404).json({
        success: false,
        message: 'Booking session not found',
      });
    }

    // Check if therapist has Google Calendar integration
    if (
      !bookingSession.therapist.googleCalendarAccessToken ||
      bookingSession.therapist.googleCalendarIntegrationStatus !== 'connected'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Google Calendar not integrated for this therapist',
      });
    }

    // Set up OAuth2 client
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    // Try with current access token, refresh if needed
    let accessToken = bookingSession.therapist.googleCalendarAccessToken;
    try {
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: bookingSession.therapist.googleCalendarRefreshToken || undefined,
      });

      // Create calendar event
      const event = await createGoogleCalendarEvent(oauth2Client, {
        sessionStartTime: bookingSession.sessionStartTime,
        therapist: {
          googleCalendarEmail: bookingSession.therapist.googleCalendarEmail,
        },
        user: {
          firstName: bookingSession.user.firstName,
          lastName: bookingSession.user.lastName,
          email: bookingSession.user.email,
        },
      });

      // Update booking session with Google Calendar event details
      await updateBookingSessionMetadata(bookingSessionId, event.id || '', event.htmlLink || '');

      return res.status(200).json({
        success: true,
        message: 'Google Calendar event created',
        eventId: event.id,
        eventLink: event.htmlLink,
      });
    } catch (error) {
      // If access token is expired, try to refresh
      if (error instanceof Error && error.message.includes('401')) {
        try {
          // Refresh access token
          if (!bookingSession.therapist.googleCalendarRefreshToken) {
            throw new Error('No refresh token available');
          }

          accessToken = await refreshAccessToken(
            bookingSession.therapist.googleCalendarRefreshToken,
          );

          // Retry with new access token
          oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: bookingSession.therapist.googleCalendarRefreshToken,
          });

          // Recreate event with refreshed token
          const event = await createGoogleCalendarEvent(oauth2Client, {
            sessionStartTime: bookingSession.sessionStartTime,
            therapist: {
              googleCalendarEmail: bookingSession.therapist.googleCalendarEmail,
            },
            user: {
              firstName: bookingSession.user.firstName,
              lastName: bookingSession.user.lastName,
              email: bookingSession.user.email,
            },
          });

          // Update booking session
          await updateBookingSessionMetadata(
            bookingSessionId,
            event.id || '',
            event.htmlLink || '',
          );

          return res.status(200).json({
            success: true,
            message: 'Google Calendar event created',
            eventId: event.id,
            eventLink: event.htmlLink,
          });
        } catch (refreshError) {
          console.error('Failed to refresh access token:', refreshError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create Google Calendar event after token refresh',
            error: refreshError instanceof Error ? refreshError.message : 'Unknown error',
          });
        }
      }

      // Other errors
      console.error('Error creating Google Calendar event:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create Google Calendar event',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } catch (error) {
    // Validation or other errors
    console.error('Google Calendar event creation error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create Google Calendar event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
