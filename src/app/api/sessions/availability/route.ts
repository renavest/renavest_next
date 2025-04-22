import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';

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
});

// Get available time slots
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const validatedData = GetAvailabilitySchema.parse({
      therapistId: searchParams.get('therapistId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      timezone: searchParams.get('timezone') || 'UTC',
    });

    // Get therapist details
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.id, parseInt(validatedData.therapistId)),
    });

    if (!therapist || !therapist.googleCalendarAccessToken) {
      return NextResponse.json(
        { error: 'Therapist not found or Google Calendar not connected' },
        { status: 404 },
      );
    }

    // Set up Google Calendar client
    oauth2Client.setCredentials({
      access_token: therapist.googleCalendarAccessToken,
      refresh_token: therapist.googleCalendarRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get therapist's calendar settings for their timezone
    const calendarSettings = await calendar.settings.get({
      setting: 'timezone',
    });
    const therapistTimezone = calendarSettings.data.value || 'UTC';

    // Get therapist's busy times from Google Calendar
    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(validatedData.startDate).toISOString(),
        timeMax: new Date(validatedData.endDate).toISOString(),
        timeZone: therapistTimezone,
        items: [{ id: 'primary' }],
      },
    });

    const busySlots = freeBusyResponse.data.calendars?.primary?.busy || [];

    // Get working hours from Google Calendar
    const calendarResponse = await calendar.calendars.get({
      calendarId: 'primary',
    });

    const workingHours = calendarResponse.data.timeZone
      ? {
          timezone: calendarResponse.data.timeZone,
          // Default working hours if not set in Google Calendar
          hours: [
            {
              daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
              start: '09:00',
              end: '17:00',
            },
          ],
        }
      : null;

    // Get existing bookings
    const existingBookings = await db.query.bookingSessions.findMany({
      where: (bookings, { and, eq, gte, lte }) =>
        and(
          eq(bookings.therapistId, parseInt(validatedData.therapistId)),
          gte(bookings.sessionStartTime, new Date(validatedData.startDate)),
          lte(bookings.sessionEndTime, new Date(validatedData.endDate)),
        ),
    });

    // Process and return available time slots
    const availableSlots = processAvailability(
      busySlots,
      workingHours,
      existingBookings,
      new Date(validatedData.startDate),
      new Date(validatedData.endDate),
      therapistTimezone,
      validatedData.timezone,
    );

    return NextResponse.json({
      slots: availableSlots,
      therapistTimezone,
      workingHours,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch availability',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
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
) {
  const availableSlots: TimeSlot[] = [];
  const slotDuration = 60; // minutes
  const currentDate = new Date(startDate);

  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay();
    const workingHoursForDay = workingHours?.hours.find((h) => h.daysOfWeek.includes(dayOfWeek));

    if (workingHoursForDay) {
      // Convert working hours to therapist's timezone
      const dayStart = new Date(
        `${currentDate.toISOString().split('T')[0]}T${workingHoursForDay.start}:00`,
      );
      const dayEnd = new Date(
        `${currentDate.toISOString().split('T')[0]}T${workingHoursForDay.end}:00`,
      );

      let slotStart = dayStart;
      while (slotStart < dayEnd) {
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

        // Check if slot is available
        const isSlotBusy =
          busySlots.some(
            (busy) => new Date(busy.start) < slotEnd && new Date(busy.end) > slotStart,
          ) ||
          existingBookings.some(
            (booking) => booking.sessionStartTime < slotEnd && booking.sessionEndTime > slotStart,
          );

        if (!isSlotBusy) {
          // Convert slot times to client's timezone
          const clientSlotStart = new Date(
            slotStart.toLocaleString('en-US', {
              timeZone: clientTimezone,
            }),
          );
          const clientSlotEnd = new Date(
            slotEnd.toLocaleString('en-US', {
              timeZone: clientTimezone,
            }),
          );

          availableSlots.push({
            start: clientSlotStart.toISOString(),
            end: clientSlotEnd.toISOString(),
          });
        }

        slotStart = slotEnd;
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }

  return availableSlots;
}
