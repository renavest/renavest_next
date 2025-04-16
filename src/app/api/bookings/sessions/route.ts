import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions, therapists, users } from '@/src/db/schema';

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
});

const UpdateBookingSchema = z.object({
  bookingId: z.number(),
  status: z.enum(['confirmed', 'cancelled', 'rescheduled']),
  cancellationReason: z.string().optional(),
});

// Create a new booking
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = CreateBookingSchema.parse(body);

    // Get user and therapist details
    const [user, therapist] = await Promise.all([
      db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, userId),
      }),
      db.query.therapists.findFirst({
        where: (therapists, { eq }) => eq(therapists.id, validatedData.therapistId),
      }),
    ]);

    if (!user || !therapist) {
      return NextResponse.json({ error: 'User or therapist not found' }, { status: 404 });
    }

    // Create booking session
    const booking = await db.insert(bookingSessions).values({
      userId: user.clerkId,
      therapistId: therapist.id,
      sessionDate: new Date(validatedData.sessionDate),
      sessionStartTime: new Date(validatedData.sessionStartTime),
      sessionEndTime: new Date(validatedData.sessionEndTime),
      status: 'pending',
    });

    // If therapist has Google Calendar connected, create calendar event
    if (therapist.googleCalendarAccessToken) {
      oauth2Client.setCredentials({
        access_token: therapist.googleCalendarAccessToken,
        refresh_token: therapist.googleCalendarRefreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: `Therapy Session with ${user.firstName} ${user.lastName}`,
          description: 'Therapy session booked through Renavest',
          start: {
            dateTime: new Date(validatedData.sessionStartTime).toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: new Date(validatedData.sessionEndTime).toISOString(),
            timeZone: 'UTC',
          },
          attendees: [{ email: user.email }, { email: therapist.googleCalendarEmail }],
        },
      });

      // Update booking with Google Calendar event ID
      await db
        .update(bookingSessions)
        .set({
          googleEventId: event.data.id,
          status: 'confirmed',
        })
        .where(eq(bookingSessions.id, booking.insertId));
    }

    // TODO: Send email notifications to both user and therapist

    return NextResponse.json({
      success: true,
      booking,
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        updatedAt: new Date(),
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
        where: (therapists, { eq }) => eq(therapists.userId, parseInt(userId)),
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
