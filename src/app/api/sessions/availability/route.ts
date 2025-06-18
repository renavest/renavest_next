import { auth, currentUser } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';
import {
  isGoogleAuthError,
  disconnectTherapistGoogleCalendar,
} from '@/src/features/google-calendar/utils/googleCalendar';
import { createTokenManager } from '@/src/features/google-calendar/utils/tokenManager';
import { createDate } from '@/src/utils/timezone';

// Create token manager instance
const tokenManager = createTokenManager(db);

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

// Helper function to validate and prepare therapist for calendar access
async function prepareTherapistCalendarAccess(therapistId: number) {
  const therapist = await db.query.therapists.findFirst({
    where: (therapists, { eq }) => eq(therapists.id, therapistId),
  });

  if (!therapist) {
    throw new Error('Therapist not found');
  }

  if (!tokenManager.validateTherapistTokens(therapist)) {
    throw new Error('Google Calendar not connected for this therapist');
  }

  // Ensure valid tokens and get OAuth2Client
  const oauth2Client = await tokenManager.ensureValidTokens({
    id: therapist.id,
    googleCalendarAccessToken: therapist.googleCalendarAccessToken,
    googleCalendarRefreshToken: therapist.googleCalendarRefreshToken,
    googleCalendarIntegrationStatus: therapist.googleCalendarIntegrationStatus,
  });

  return { therapist, oauth2Client };
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

    // Prepare therapist calendar access with improved token management
    const { oauth2Client } = await prepareTherapistCalendarAccess(therapistId);
    console.log('Successfully prepared calendar access for therapist:', therapistId);

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
      });
    } catch (calendarError: unknown) {
      console.error('Error fetching calendar data (non-auth):', calendarError);

      // Check if this is a Google Calendar authentication error
      if (isGoogleAuthError(calendarError)) {
        console.error('Google Calendar authentication failed for therapist:', therapistId);

        // Disconnect the therapist's Google Calendar integration
        try {
          await disconnectTherapistGoogleCalendar(db, therapistId);
          console.log('Disconnected Google Calendar for therapist:', therapistId);
        } catch (disconnectError) {
          console.error('Failed to disconnect therapist calendar:', disconnectError);
        }

        return NextResponse.json(
          {
            success: false,
            message: 'Google Calendar authentication failed. Please reconnect your calendar.',
            error: 'Authentication failed',
            errorType: 'auth_error',
            needsReconnect: true,
          },
          { status: 401 },
        );
      }

      // Handle other API errors (403 insufficient permission, etc.)
      const errorMessage = calendarError instanceof Error ? calendarError.message : 'Unknown error';
      const errorObj = calendarError as { code?: number; response?: { status?: number } };
      const isPermissionError =
        errorMessage.includes('Insufficient Permission') ||
        errorMessage.includes('403') ||
        errorObj?.code === 403 ||
        errorObj?.response?.status === 403;

      if (isPermissionError) {
        console.error('Google Calendar permission error for therapist:', therapistId);

        // For permission errors, also disconnect since the integration is not working
        try {
          await disconnectTherapistGoogleCalendar(db, therapistId);
          console.log(
            'Disconnected Google Calendar due to permission error for therapist:',
            therapistId,
          );
        } catch (disconnectError) {
          console.error('Failed to disconnect therapist calendar:', disconnectError);
        }

        return NextResponse.json(
          {
            success: false,
            message:
              'Google Calendar permissions insufficient. Please reconnect your calendar with full permissions.',
            error: errorMessage,
            errorType: 'permission_error',
            needsReconnect: true,
          },
          { status: 403 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch availability',
          error: errorMessage,
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
