import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions, therapists } from '@/src/db/schema';
import {
  disconnectTherapistGoogleCalendar,
  isGoogleAuthError,
} from '@/src/features/google-calendar/utils/googleCalendar';
import { createDate } from '@/src/utils/timezone';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Validation schemas
const GetAvailabilitySchema = z.object({
  therapistId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  timezone: z.string(), // Client's timezone
  view: z.string(),
});

// Type for time slots throughout the application
interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
}

// Get available time slots
export async function GET(req: NextRequest) {
  try {
    auth.protect();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const searchParams = req.nextUrl.searchParams;
    const validatedData = GetAvailabilitySchema.parse({
      therapistId: searchParams.get('therapistId'),
      startDate: decodeURIComponent(searchParams.get('startDate') || ''),
      endDate: decodeURIComponent(searchParams.get('endDate') || ''),
      timezone: searchParams.get('timezone') || 'UTC',
      view: searchParams.get('view') || 'client',
    });

    const therapistId = parseInt(validatedData.therapistId);

    // Get therapist details
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.id, therapistId),
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    if (
      !therapist.googleCalendarAccessToken ||
      !therapist.googleCalendarRefreshToken ||
      therapist.googleCalendarIntegrationStatus !== 'connected'
    ) {
      console.log('Google Calendar not connected for therapist:', validatedData.therapistId);
      return NextResponse.json(
        { error: 'Google Calendar not connected for this therapist' },
        { status: 401 },
      );
    }

    console.log('Setting up OAuth client for therapist:', validatedData.therapistId);
    // Set up Google Calendar client
    oauth2Client.setCredentials({
      access_token: therapist.googleCalendarAccessToken,
      refresh_token: therapist.googleCalendarRefreshToken,
    });

    // Attempt to refresh the token if needed - only if we have a refresh token
    let tokenRefreshed = false;
    if (therapist.googleCalendarRefreshToken) {
      try {
        console.log('Refreshing access token for therapist:', validatedData.therapistId);
        const { credentials } = await oauth2Client.refreshAccessToken();

        // Only update tokens if we got a valid access token back
        if (credentials.access_token) {
          // Update the tokens in the database
          await db
            .update(therapists)
            .set({
              googleCalendarAccessToken: credentials.access_token,
              googleCalendarRefreshToken:
                credentials.refresh_token || therapist.googleCalendarRefreshToken,
              updatedAt: createDate(new Date(), 'UTC').toJSDate(),
            })
            .where(eq(therapists.id, therapistId));

          // Update the client with new credentials
          oauth2Client.setCredentials({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token || therapist.googleCalendarRefreshToken,
          });
          tokenRefreshed = true;
          console.log('Token refreshed successfully for therapist:', validatedData.therapistId);
        }
      } catch (refreshError) {
        // Only disconnect on specific auth errors, not any error
        const isAuthError = isGoogleAuthError(refreshError);

        if (isAuthError) {
          // If token refresh fails with an auth error, disconnect therapist
          console.error('Auth error refreshing token:', refreshError);
          await disconnectTherapistGoogleCalendar(db, therapistId);
          return NextResponse.json(
            {
              error: 'Google Calendar integration authentication failed. Please reconnect.',
              authError: true,
              errorType: 'auth_error',
              needsReconnect: true,
            },
            { status: 401 },
          );
        } else {
          // For non-auth errors, log but don't disconnect - might be temporary
          console.error('Non-auth error refreshing token:', refreshError);
          // Continue with the existing token, it might still work
        }
      }
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      // Get therapist's calendar settings for their timezone
      console.log('Fetching calendar settings for therapist:', validatedData.therapistId);
      const calendarSettings = await calendar.settings.get({
        setting: 'timezone',
      });
      const therapistTimezone = calendarSettings.data.value || 'UTC';

      // Get therapist's busy times from Google Calendar
      console.log('Fetching busy times for therapist:', validatedData.therapistId);

      // Parse dates and convert to UTC for Google Calendar API
      const startDateTime = createDate(validatedData.startDate);
      const endDateTime = createDate(validatedData.endDate);
      const timeMin = startDateTime.toUTC().toISO();
      const timeMax = endDateTime.toUTC().toISO();

      const freeBusyResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          timeZone: therapistTimezone,
          items: [{ id: 'primary' }],
        },
      });

      // Convert Google Calendar busy slots to our TimeSlot format
      const busySlots: TimeSlot[] = (freeBusyResponse.data.calendars?.primary?.busy || [])
        .map((slot) => ({
          start: slot.start || '',
          end: slot.end || '',
        }))
        .filter((slot) => slot.start && slot.end); // Ensure we have start and end times

      // Get working hours from database
      console.log('Fetching working hours for therapist:', validatedData.therapistId);
      const storedWorkingHours = await db.query.therapistAvailability.findMany({
        where: (availability, { eq }) => eq(availability.therapistId, therapistId),
        orderBy: (availability, { asc }) => [
          asc(availability.dayOfWeek),
          asc(availability.startTime),
        ],
      });

      // Convert stored working hours to the format expected by processAvailability
      const workingHours =
        storedWorkingHours.length > 0
          ? {
              timezone: therapistTimezone,
              hours: storedWorkingHours.map((hour) => ({
                daysOfWeek: [hour.dayOfWeek],
                start: hour.startTime,
                end: hour.endTime,
              })),
            }
          : {
              timezone: therapistTimezone,
              // Default working hours if none are set
              hours: [
                {
                  daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
                  start: '09:00',
                  end: '17:00',
                },
              ],
            };

      // Get existing bookings
      console.log('Fetching existing bookings for therapist:', validatedData.therapistId);
      const existingBookings = await db.query.bookingSessions.findMany({
        where: (bookings, { and, eq, gte, lte }) =>
          and(
            eq(bookings.therapistId, therapistId),
            gte(bookings.sessionStartTime, createDate(validatedData.startDate, 'UTC').toJSDate()),
            lte(bookings.sessionEndTime, createDate(validatedData.endDate, 'UTC').toJSDate()),
          ),
      });

      // Process and return available time slots
      const availableSlots = processAvailability(
        busySlots,
        workingHours,
        existingBookings,
        createDate(validatedData.startDate, 'UTC').toJSDate(),
        createDate(validatedData.endDate, 'UTC').toJSDate(),
        therapistTimezone,
        validatedData.timezone,
        validatedData.view,
      );

      console.log(
        'Successfully fetched availability for therapist:',
        validatedData.therapistId,
        `(${availableSlots.length} slots available)`,
      );

      return NextResponse.json({
        slots: availableSlots,
        therapistTimezone,
        workingHours,
        tokenRefreshed,
      });
    } catch (calendarError: unknown) {
      // Only disconnect for clear auth errors
      const isAuthError = isGoogleAuthError(calendarError);

      if (isAuthError) {
        console.error('Auth error fetching calendar data:', calendarError);
        await disconnectTherapistGoogleCalendar(db, therapistId);
        return NextResponse.json(
          {
            error: 'Google Calendar authentication failed. Please reconnect.',
            authError: true,
            errorType: 'auth_error',
            needsReconnect: true,
          },
          { status: 401 },
        );
      }

      // For other errors, log but don't disconnect
      console.error('Error fetching calendar data (non-auth):', calendarError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch availability',
          error: calendarError instanceof Error ? calendarError.message : 'Unknown error',
          errorType: 'api_error',
          needsReconnect: false,
        },
        { status: 500 },
      );
    }
  } catch (error: unknown) {
    // General error handling
    console.error('Error in availability endpoint:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch availability',
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: 'general_error',
        needsReconnect: false,
      },
      { status: 500 },
    );
  }
}

// Helper function to process availability and return available time slots
function processAvailability(
  busySlots: TimeSlot[],
  workingHours: {
    timezone: string;
    hours: Array<{
      daysOfWeek: number[];
      start: string;
      end: string;
    }>;
  } | null,
  existingBookings: (typeof bookingSessions.$inferSelect)[],
  startDate: Date,
  endDate: Date,
  therapistTimezone: string,
  clientTimezone: string,
  view: string,
) {
  const availableSlots: TimeSlot[] = [];
  const slotDuration = 60; // minutes
  let currentDate = createDate(startDate, therapistTimezone);

  while (currentDate.toJSDate() <= endDate) {
    // Luxon weekday: Monday=1, Tuesday=2, ..., Sunday=7
    // Database stores: Monday=1, Tuesday=2, ..., Sunday=7 (same as Luxon)
    const dayOfWeek = currentDate.weekday;
    const workingHoursForDay = workingHours?.hours.find((h) => h.daysOfWeek.includes(dayOfWeek));

    if (workingHoursForDay) {
      // Create date objects in therapist's timezone using Luxon
      const currentDateStr = currentDate.toISODate(); // Get YYYY-MM-DD format
      const dayStartDate = createDate(
        `${currentDateStr}T${workingHoursForDay.start}:00`,
        therapistTimezone,
      );
      const dayEndDate = createDate(
        `${currentDateStr}T${workingHoursForDay.end}:00`,
        therapistTimezone,
      );

      // Get the JavaScript Date objects for manipulation
      let slotStart = dayStartDate.toJSDate();

      while (slotStart < dayEndDate.toJSDate()) {
        const slotEndDateTime = createDate(slotStart, therapistTimezone).plus({
          minutes: slotDuration,
        });
        const slotEnd = slotEndDateTime.toJSDate();

        // Check if slot is available (not busy from Google Calendar and no existing booking)
        const isSlotBusy =
          busySlots.some(
            (busy) =>
              createDate(busy.start, therapistTimezone).toJSDate() < slotEnd &&
              createDate(busy.end, therapistTimezone).toJSDate() > slotStart,
          ) ||
          existingBookings.some(
            (booking) =>
              createDate(booking.sessionStartTime, therapistTimezone).toJSDate() < slotEnd &&
              createDate(booking.sessionEndTime, therapistTimezone).toJSDate() > slotStart,
          );

        if (!isSlotBusy) {
          // For therapist dashboard, show times in therapist's timezone
          // For client booking, convert to client's timezone
          if (view === 'therapist') {
            // Keep in therapist timezone for therapist dashboard
            const therapistSlotStartDateTime = createDate(slotStart, therapistTimezone);
            const therapistSlotEndDateTime = createDate(slotEnd, therapistTimezone);

            availableSlots.push({
              start: therapistSlotStartDateTime.toISO() || '',
              end: therapistSlotEndDateTime.toISO() || '',
            });
          } else {
            // Convert to client timezone for booking interface
            const clientSlotStartDateTime = createDate(slotStart, therapistTimezone).setZone(
              clientTimezone,
            );
            const clientSlotEndDateTime = createDate(slotEnd, therapistTimezone).setZone(
              clientTimezone,
            );

            availableSlots.push({
              start: clientSlotStartDateTime.toISO() || '',
              end: clientSlotEndDateTime.toISO() || '',
            });
          }
        }

        slotStart = slotEnd;
      }
    }

    // Move to next day using Luxon
    currentDate = currentDate.plus({ days: 1 }).startOf('day');
  }

  return availableSlots;
}
