import { OAuth2Client } from 'google-auth-library';
import { calendar_v3, google } from 'googleapis';
import { eq } from 'drizzle-orm';
import { bookingSessions, therapists } from '@/src/db/schema';

interface CreateAndStoreGoogleCalendarEventParams {
  booking: any; // Should be BookingType
  therapist: any; // Should be TherapistType
  user: any; // Should be UserType
  db: any;
}

export async function createAndStoreGoogleCalendarEvent({
  booking,
  therapist,
  user,
  db,
}: CreateAndStoreGoogleCalendarEventParams) {
  if (
    !therapist.googleCalendarAccessToken ||
    therapist.googleCalendarIntegrationStatus !== 'connected'
  ) {
    throw new Error('Google Calendar not integrated for this therapist');
  }

  // Set up OAuth2 client
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  oauth2Client.setCredentials({
    access_token: therapist.googleCalendarAccessToken,
    refresh_token: therapist.googleCalendarRefreshToken || undefined,
  });

  // Helper to refresh token if needed
  async function refreshAccessToken(refreshToken: string) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await db
      .update(therapists)
      .set({
        googleCalendarAccessToken: credentials.access_token,
        updatedAt: new Date(),
      })
      .where(eq(therapists.googleCalendarRefreshToken, refreshToken));
    oauth2Client.setCredentials({
      access_token: credentials.access_token,
      refresh_token: refreshToken,
    });
    return credentials.access_token;
  }

  // Create event with conferenceData
  const calendarService = google.calendar({ version: 'v3', auth: oauth2Client });
  const sessionStart = booking.sessionStartTime;
  const sessionEnd =
    booking.sessionEndTime || new Date(new Date(sessionStart).getTime() + 60 * 60 * 1000); // fallback 1hr
  const requestId = `renavest-${booking.id || Date.now()}`;

  let event;
  try {
    event = await calendarService.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Therapy Session with ${user.firstName || ''} ${user.lastName || ''}`.trim(),
        description: 'Therapy session booked through Renavest',
        start: { dateTime: new Date(sessionStart).toISOString(), timeZone: 'UTC' },
        end: { dateTime: new Date(sessionEnd).toISOString(), timeZone: 'UTC' },
        attendees: [{ email: therapist.googleCalendarEmail || '' }, { email: user.email }],
        conferenceData: {
          createRequest: { requestId },
        },
      },
    });
  } catch (error: any) {
    // Try to refresh token if unauthorized
    if (error?.code === 401 && therapist.googleCalendarRefreshToken) {
      await refreshAccessToken(therapist.googleCalendarRefreshToken);
      event = await calendarService.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: {
          summary: `Therapy Session with ${user.firstName || ''} ${user.lastName || ''}`.trim(),
          description: 'Therapy session booked through Renavest',
          start: { dateTime: new Date(sessionStart).toISOString(), timeZone: 'UTC' },
          end: { dateTime: new Date(sessionEnd).toISOString(), timeZone: 'UTC' },
          attendees: [{ email: therapist.googleCalendarEmail || '' }, { email: user.email }],
          conferenceData: {
            createRequest: { requestId },
          },
        },
      });
    } else {
      throw error;
    }
  }

  const eventData = event.data;
  let googleMeetLink = '';
  if (eventData.conferenceData && eventData.conferenceData.entryPoints) {
    const meetEntry = eventData.conferenceData.entryPoints.find(
      (ep) =>
        ep.entryPointType === 'video' &&
        typeof ep.uri === 'string' &&
        ep.uri.includes('meet.google.com'),
    );
    googleMeetLink = meetEntry && typeof meetEntry.uri === 'string' ? meetEntry.uri : '';
  }

  // Update booking session with event details
  await db
    .update(bookingSessions)
    .set({
      googleEventId: eventData.id || '',
      status: 'confirmed',
      metadata: {
        ...(booking.metadata || {}),
        googleCalendarEventId: eventData.id || '',
        googleCalendarEventLink: eventData.htmlLink || '',
        googleMeetLink: googleMeetLink || '',
      },
    })
    .where(eq(bookingSessions.id, booking.id));

  return {
    eventId: eventData.id,
    eventLink: eventData.htmlLink,
    googleMeetLink,
  };
}
