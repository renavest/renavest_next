import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

import { bookingSessions, therapists } from '@/src/db/schema';
import { createDate } from '@/src/utils/timezone';

interface BookingType {
  id: number;
  sessionStartTime: Date;
  sessionEndTime: Date;
  metadata: unknown;
  userId: string;
  therapistId: number;
  status: string;
  googleEventId: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TherapistType {
  id: number;
  name: string;
  email: string | null;
  googleCalendarAccessToken: string | null;
  googleCalendarRefreshToken: string | null;
  googleCalendarEmail: string | null;
  googleCalendarIntegrationStatus: string;
  firstName?: string;
  lastName?: string;
}

interface UserType {
  id: number;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  isActive: boolean;
  therapistId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateAndStoreGoogleCalendarEventParams {
  booking: BookingType;
  therapist: TherapistType;
  user: UserType;
  db: NodePgDatabase<Record<string, unknown>>;
}

/**
 * Creates event request body for Google Calendar API
 */
function createEventRequestBody(
  sessionStart: string | Date,
  sessionEnd: string | Date,
  user: UserType,
  therapist: TherapistType,
  requestId: string,
) {
  return {
    summary: `Therapy Session with ${user.firstName || ''} ${user.lastName || ''}`.trim(),
    description: 'Therapy session booked through Renavest',
    start: { dateTime: createDate(sessionStart, 'UTC').toISO(), timeZone: 'UTC' },
    end: { dateTime: createDate(sessionEnd, 'UTC').toISO(), timeZone: 'UTC' },
    attendees: [{ email: therapist.googleCalendarEmail || '' }, { email: user.email }],
    conferenceData: {
      createRequest: { requestId },
    },
  };
}

/**
 * Checks if an error is a Google Calendar authentication error
 * This is used to determine if we need to disconnect a therapist's integration
 * Only returns true for clear authentication errors, not for generic API errors
 */
export function isGoogleAuthError(error: unknown): boolean {
  const err = error as { code?: number; response?: { status?: number }; message?: string };

  // Check for clear authorization or authentication errors
  return (
    // Direct HTTP 401 Unauthorized status
    err?.code === 401 ||
    err?.response?.status === 401 ||
    // OAuth specific error messages
    (typeof err?.message === 'string' &&
      (err.message.includes('invalid_grant') ||
        err.message.includes('invalid_token') ||
        err.message.includes('token expired') ||
        err.message.includes('invalid_request') ||
        err.message.includes('unauthorized') ||
        err.message.includes('access_denied') ||
        (err.message.toLowerCase().includes('auth') && err.message.toLowerCase().includes('fail'))))
  );
}

/**
 * Handles Google Calendar event creation and booking update
 */
export async function createAndStoreGoogleCalendarEvent({
  booking,
  therapist,
  user,
  db,
}: CreateAndStoreGoogleCalendarEventParams) {
  // Validate Google Calendar integration
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

  const calendarService = google.calendar({ version: 'v3', auth: oauth2Client });
  const sessionStart = booking.sessionStartTime;
  // Calculate session end time if not provided - add 1 hour
  const sessionEnd =
    booking.sessionEndTime || createDate(sessionStart, 'UTC').plus({ hours: 1 }).toJSDate();

  const requestId = `renavest-${booking.id || Date.now()}`;

  let event;
  try {
    event = await calendarService.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: createEventRequestBody(sessionStart, sessionEnd, user, therapist, requestId),
    });
  } catch (error: unknown) {
    // Handle authentication errors
    if (isGoogleAuthError(error)) {
      await disconnectTherapistGoogleCalendar(db, therapist.id);
      throw new Error('Google Calendar authentication failed. Therapist disconnected.');
    }

    // Handle token refresh
    const err = error as { code?: number };
    if (err?.code === 401 && therapist.googleCalendarRefreshToken) {
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update therapist's access token
      await db
        .update(therapists)
        .set({
          googleCalendarAccessToken: credentials.access_token,
          updatedAt: createDate(new Date(), 'UTC').toJSDate(),
        })
        .where(eq(therapists.googleCalendarRefreshToken, therapist.googleCalendarRefreshToken));

      oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: therapist.googleCalendarRefreshToken,
      });

      // Retry creating the event with fresh token
      event = await calendarService.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: createEventRequestBody(sessionStart, sessionEnd, user, therapist, requestId),
      });
    } else {
      throw error;
    }
  }

  // Extract Google Meet link
  const eventData = event.data;
  const googleMeetLink =
    eventData.conferenceData?.entryPoints?.find(
      (ep) =>
        ep.entryPointType === 'video' &&
        typeof ep.uri === 'string' &&
        ep.uri.includes('meet.google.com'),
    )?.uri || '';

  // Update booking with Google Calendar info
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

/**
 * Disconnects a therapist's Google Calendar integration
 */
export async function disconnectTherapistGoogleCalendar(
  db: NodePgDatabase<Record<string, unknown>>,
  therapistId: number,
) {
  console.warn(
    `Therapist ${therapistId} Google Calendar integration disconnected due to authentication failure.`,
  );

  await db
    .update(therapists)
    .set({
      googleCalendarAccessToken: null,
      googleCalendarRefreshToken: null,
      googleCalendarEmail: null,
      googleCalendarIntegrationStatus: 'not_connected',
      googleCalendarIntegrationDate: null,
      updatedAt: createDate(new Date(), 'UTC').toJSDate(),
    })
    .where(eq(therapists.id, therapistId));
}

/**
 * Creates a new Google OAuth client with environment variables
 */
export function createGoogleOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}
