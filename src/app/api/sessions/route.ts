import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { calendar_v3, google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';
import { sendBookingConfirmationEmail } from '@/src/features/booking/actions/sendBookingConfirmationEmail';
import { SupportedTimezone } from '@/src/features/booking/utils/timezoneManager';
import { createAndStoreGoogleCalendarEvent } from '@/src/features/google-calendar/utils/googleCalendar';
import { createDate } from '@/src/utils/timezone';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Validation schemas
const CreateBookingSchema = z.object({
  therapistId: z.number(),
  sessionDate: z.string(),
  sessionStartTime: z.string(),
  sessionEndTime: z.string(),
  timezone: z.string(), // Client's timezone
});

const UpdateBookingSchema = z.object({
  bookingId: z.number(),
  status: z.enum(['confirmed', 'cancelled', 'rescheduled']),
  cancellationReason: z.string().optional(),
});

// Types for the API (matching Google Calendar utility expectations)
type UserType = {
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
};

type TherapistType = {
  id: number;
  name: string;
  email: string | null;
  googleCalendarAccessToken: string | null;
  googleCalendarRefreshToken: string | null;
  googleCalendarEmail: string | null;
  googleCalendarIntegrationStatus: string;
};

// Helper function to get user and therapist details
async function getUserAndTherapist(
  userId: string,
  therapistId: number,
): Promise<[UserType | null, TherapistType | null]> {
  const [user, therapist] = await Promise.all([
    db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, userId),
    }) as Promise<UserType | null>,
    db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.id, therapistId),
    }) as Promise<TherapistType | null>,
  ]);

  return [user, therapist];
}

// Helper function to get therapist's timezone
async function getTherapistTimezone(calendar: calendar_v3.Calendar) {
  const calendarSettings = await calendar.settings.get({
    setting: 'timezone',
  });
  return calendarSettings.data.value || 'UTC';
}

// Helper function to check slot availability
async function checkSlotAvailability(
  calendar: calendar_v3.Calendar,
  startTime: Date,
  endTime: Date,
  therapistTimezone: string,
) {
  const freeBusyResponse = await calendar.freebusy.query({
    requestBody: {
      timeMin: createDate(startTime, 'UTC').toISO(),
      timeMax: createDate(endTime, 'UTC').toISO(),
      timeZone: therapistTimezone,
      items: [{ id: 'primary' }],
    },
  });

  const busySlots = freeBusyResponse.data.calendars?.primary?.busy || [];
  return busySlots.length === 0;
}

// Create a new booking
export async function POST(req: NextRequest) {
  try {
    auth.protect();
    const userId = (await currentUser())?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = CreateBookingSchema.parse(body);

    // Get user and therapist details
    const [user, therapist] = await getUserAndTherapist(userId, validatedData.therapistId);
    if (!user || !therapist) {
      return NextResponse.json({ error: 'User or therapist not found' }, { status: 404 });
    }

    // Set up Google Calendar client
    oauth2Client.setCredentials({
      access_token: therapist.googleCalendarAccessToken,
      refresh_token: therapist.googleCalendarRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get therapist's timezone
    const therapistTimezone = await getTherapistTimezone(calendar);

    // Convert session times from client timezone to therapist timezone
    const clientStartTime = createDate(validatedData.sessionStartTime, validatedData.timezone);
    const clientEndTime = createDate(validatedData.sessionEndTime, validatedData.timezone);

    const therapistStartTime = clientStartTime.setZone(therapistTimezone).toJSDate();
    const therapistEndTime = clientEndTime.setZone(therapistTimezone).toJSDate();

    // Verify the slot is still available
    const isSlotAvailable = await checkSlotAvailability(
      calendar,
      therapistStartTime,
      therapistEndTime,
      therapistTimezone,
    );

    if (!isSlotAvailable) {
      return NextResponse.json(
        {
          success: false,
          message: 'The selected time slot is no longer available',
        },
        { status: 409 },
      );
    }

    // Create booking session
    const bookingResult = await db
      .insert(bookingSessions)
      .values({
        userId: user.id,
        therapistId: therapist.id,
        sessionDate: therapistStartTime,
        sessionStartTime: therapistStartTime,
        sessionEndTime: therapistEndTime,
        status: 'pending',
        metadata: {
          clientTimezone: validatedData.timezone,
          therapistTimezone,
        },
      })
      .returning();

    const booking = bookingResult[0];

    // Use shared utility for Google Calendar event creation
    let calendarResult = null;
    if (
      therapist.googleCalendarAccessToken &&
      therapist.googleCalendarIntegrationStatus === 'connected'
    ) {
      try {
        calendarResult = await createAndStoreGoogleCalendarEvent({
          booking,
          therapist,
          user,
          db,
        });
      } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        // Optionally: return error or continue
      }
    }

    // Send confirmation email with timezone-aware details and Google Meet link
    if (user && therapist) {
      await sendBookingConfirmationEmail({
        clientEmail: user.email,
        therapistEmail: therapist.googleCalendarEmail || '',
        sessionDate: createDate(booking.sessionDate).toFormat('yyyy-MM-dd'),
        sessionTime: createDate(booking.sessionStartTime).toFormat('HH:mm'),
        clientTimezone: validatedData.timezone as SupportedTimezone,
        therapistTimezone: therapistTimezone as SupportedTimezone,
        googleMeetLink: calendarResult?.googleMeetLink,
        therapistName: therapist.name,
        clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      });
    }

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        clientTimezone: validatedData.timezone,
        therapistTimezone,
        googleCalendarEventId: calendarResult?.eventId || null,
        googleCalendarEventLink: calendarResult?.eventLink || null,
        googleMeetLink: calendarResult?.googleMeetLink || null,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create booking',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Update booking status
export async function PATCH(req: NextRequest) {
  try {
    auth.protect();
    const body = await req.json();
    const validatedData = UpdateBookingSchema.parse(body);

    // Get the booking and verify ownership
    const booking = await db.query.bookingSessions.findFirst({
      where: (bookings, { eq }) => eq(bookings.id, validatedData.bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking status
    await db
      .update(bookingSessions)
      .set({
        status: validatedData.status,
        cancellationReason: validatedData.cancellationReason,
        updatedAt: createDate(new Date(), 'UTC').toJSDate(),
      })
      .where(eq(bookingSessions.id, validatedData.bookingId));

    // If booking has a Google Calendar event, update it
    if (booking.googleEventId) {
      const therapist = await db.query.therapists.findFirst({
        where: (therapists, { eq }) => eq(therapists.id, booking.therapistId),
      });

      if (therapist?.googleCalendarAccessToken) {
        oauth2Client.setCredentials({
          access_token: therapist.googleCalendarAccessToken,
          refresh_token: therapist.googleCalendarRefreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        if (validatedData.status === 'cancelled') {
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: booking.googleEventId,
          });
        }
      }
    }

    // TODO: Send email notifications about booking status change

    return NextResponse.json({
      success: true,
      status: validatedData.status,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update booking',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Get bookings
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get('role'); // 'client' or 'therapist'

    let bookings;
    if (role === 'therapist') {
      const therapist = await db.query.therapists.findFirst({
        where: (therapists, { eq }) => eq(therapists.userId, userId),
      });

      if (!therapist) {
        return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
      }

      bookings = await db.query.bookingSessions.findMany({
        where: (bookings, { eq }) => eq(bookings.therapistId, therapist.id),
        orderBy: (bookings, { desc }) => [desc(bookings.sessionDate)],
      });
    } else {
      // Default to client role
      bookings = await db.query.bookingSessions.findMany({
        where: (bookings, { eq }) => eq(bookings.userId, userId),
        orderBy: (bookings, { desc }) => [desc(bookings.sessionDate)],
      });
    }

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch bookings',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
