import { auth } from '@clerk/nextjs/server';
import { and, eq, gte, lte } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import {
  therapistAvailability,
  therapistBlockedTimes,
  therapists,
  bookingSessions,
} from '@/src/db/schema';

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
});

const SetAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  isRecurring: z.boolean().default(true),
});

// Get available time slots
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const validatedData = GetAvailabilitySchema.parse({
      therapistId: searchParams.get('therapistId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });

    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    // Get therapist's recurring availability
    const availability = await db.query.therapistAvailability.findMany({
      where: (availability, { eq }) =>
        eq(availability.therapistId, parseInt(validatedData.therapistId)),
    });

    // Get blocked times
    const blockedTimes = await db.query.therapistBlockedTimes.findMany({
      where: (blockedTimes, { and, eq, gte, lte }) =>
        and(
          eq(blockedTimes.therapistId, parseInt(validatedData.therapistId)),
          gte(blockedTimes.startTime, startDate),
          lte(blockedTimes.endTime, endDate),
        ),
    });

    // Get existing bookings
    const existingBookings = await db.query.bookingSessions.findMany({
      where: (bookings, { and, eq, gte, lte }) =>
        and(
          eq(bookings.therapistId, parseInt(validatedData.therapistId)),
          gte(bookings.sessionStartTime, startDate),
          lte(bookings.sessionEndTime, endDate),
        ),
    });

    // Get therapist's Google Calendar events if connected
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.id, parseInt(validatedData.therapistId)),
    });

    let googleEvents: any[] = [];
    if (therapist?.googleCalendarAccessToken) {
      oauth2Client.setCredentials({
        access_token: therapist.googleCalendarAccessToken,
        refresh_token: therapist.googleCalendarRefreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      googleEvents = response.data.items || [];
    }

    // Process and return available time slots
    const availableSlots = processAvailability(
      availability,
      blockedTimes,
      existingBookings,
      googleEvents,
      startDate,
      endDate,
    );

    return NextResponse.json({ slots: availableSlots });
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

// Set therapist availability
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = SetAvailabilitySchema.parse(body);

    // Get therapist ID from authenticated user
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.userId, parseInt(userId)),
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Create availability record
    const newAvailability = await db.insert(therapistAvailability).values({
      therapistId: therapist.id,
      dayOfWeek: validatedData.dayOfWeek,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      isRecurring: validatedData.isRecurring,
    });

    return NextResponse.json({
      success: true,
      availability: newAvailability,
    });
  } catch (error) {
    console.error('Error setting availability:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to set availability',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Helper function to process availability and return available time slots
function processAvailability(
  availability: (typeof therapistAvailability.$inferSelect)[],
  blockedTimes: (typeof therapistBlockedTimes.$inferSelect)[],
  existingBookings: (typeof bookingSessions.$inferSelect)[],
  googleEvents: any[],
  startDate: Date,
  endDate: Date,
) {
  // Implementation of availability processing logic
  // This would include:
  // 1. Converting recurring availability to specific time slots
  // 2. Removing blocked times
  // 3. Removing existing bookings
  // 4. Removing Google Calendar events
  // 5. Returning available time slots in 30/60 minute increments

  // For now, return a placeholder implementation
  return [];
}
