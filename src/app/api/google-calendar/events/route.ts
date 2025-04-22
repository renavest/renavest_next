import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import { calendar_v3, google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { therapists, bookingSessions } from '@/src/db/schema';

const CreateCalendarEventSchema = z.object({
  bookingSessionId: z.number(),
});

async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  await db
    .update(therapists)
    .set({
      googleCalendarAccessToken: credentials.access_token,
      updatedAt: new Date(),
    })
    .where(eq(therapists.googleCalendarRefreshToken, refreshToken));
  return credentials.access_token;
}

async function createGoogleCalendarEvent(
  oauth2Client: OAuth2Client,
  bookingSession: {
    sessionStartTime: Date;
    therapist: { googleCalendarEmail: string | null };
    user: { firstName: string | null; lastName: string | null; email: string };
    id?: number;
  },
): Promise<calendar_v3.Schema$Event> {
  const calendarService = google.calendar({ version: 'v3', auth: oauth2Client });
  const sessionStart = bookingSession.sessionStartTime;
  const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000); // 1 hour
  const requestId = `renavest-${bookingSession.id || Date.now()}`;
  const event = await calendarService.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary:
        `Financial Therapy Session with ${bookingSession.user.firstName || ''} ${bookingSession.user.lastName || ''}`.trim(),
      description: 'Renavest Financial Therapy Session',
      start: { dateTime: sessionStart.toISOString(), timeZone: 'UTC' },
      end: { dateTime: sessionEnd.toISOString(), timeZone: 'UTC' },
      attendees: [
        { email: bookingSession.therapist.googleCalendarEmail || '' },
        { email: bookingSession.user.email },
      ],
      conferenceData: {
        createRequest: {
          requestId,
        },
      },
    },
  });
  return event.data;
}

async function fetchBookingSessionDetails(bookingSessionId: number) {
  return db.query.bookingSessions.findFirst({
    where: eq(bookingSessions.id, bookingSessionId),
    with: {
      therapist: {
        columns: {
          id: true,
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

async function updateBookingSessionMetadata(
  bookingSessionId: number,
  eventId: string,
  eventLink: string,
  googleMeetLink: string,
) {
  return db
    .update(bookingSessions)
    .set({
      metadata: {
        googleCalendarEventId: eventId,
        googleCalendarEventLink: eventLink,
        googleMeetLink: googleMeetLink ?? '',
      },
    })
    .where(eq(bookingSessions.id, bookingSessionId));
}

export async function POST(req: NextRequest) {
  // Clerk auth
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  // Parse and validate body
  const body = await req.json();
  const parseResult = CreateCalendarEventSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid request', errors: parseResult.error.errors },
      { status: 400 },
    );
  }
  const { bookingSessionId } = parseResult.data;
  // Fetch booking session
  const bookingSession = await fetchBookingSessionDetails(bookingSessionId);
  if (!bookingSession) {
    return NextResponse.json(
      { success: false, message: 'Booking session not found' },
      { status: 404 },
    );
  }
  // Only allow therapist to create event for their own session
  if (bookingSession.therapist.id !== parseInt(userId)) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }
  // Check Google Calendar integration
  if (
    !bookingSession.therapist.googleCalendarAccessToken ||
    bookingSession.therapist.googleCalendarIntegrationStatus !== 'connected'
  ) {
    return NextResponse.json(
      { success: false, message: 'Google Calendar not integrated for this therapist' },
      { status: 400 },
    );
  }
  // Set up OAuth2 client
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  let accessToken = bookingSession.therapist.googleCalendarAccessToken;
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: bookingSession.therapist.googleCalendarRefreshToken || undefined,
  });
  // Try to create event, refresh token if needed
  let event;
  try {
    event = await createGoogleCalendarEvent(oauth2Client, bookingSession);
  } catch (error: unknown) {
    const err = error as { code?: unknown; message?: string };
    if (
      typeof err.code === 'number' &&
      err.code === 401 &&
      bookingSession.therapist.googleCalendarRefreshToken
    ) {
      accessToken = await refreshAccessToken(bookingSession.therapist.googleCalendarRefreshToken);
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: bookingSession.therapist.googleCalendarRefreshToken,
      });
      event = await createGoogleCalendarEvent(oauth2Client, bookingSession);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create Google Calendar event',
          error: err.message || 'Unknown error',
        },
        { status: 500 },
      );
    }
  }
  // Update booking session with event details
  let googleMeetLink = '';
  if (event.conferenceData && event.conferenceData.entryPoints) {
    const meetEntry = event.conferenceData.entryPoints.find(
      (ep) =>
        ep.entryPointType === 'video' &&
        typeof ep.uri === 'string' &&
        ep.uri.includes('meet.google.com'),
    );
    googleMeetLink = (
      meetEntry && typeof meetEntry.uri === 'string' ? meetEntry.uri : ''
    ) as string;
  }
  await updateBookingSessionMetadata(
    bookingSessionId,
    event.id || '',
    event.htmlLink || '',
    googleMeetLink,
  );
  return NextResponse.json({
    success: true,
    message: 'Google Calendar event created',
    eventId: event.id,
    eventLink: event.htmlLink,
    googleMeetLink,
  });
}
