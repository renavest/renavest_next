import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';
import { sendBookingConfirmationEmail } from '@/src/features/booking/actions/sendBookingConfirmationEmail';
import { SupportedTimezone } from '@/src/features/booking/utils/timezoneManager';
import { createAndStoreGoogleCalendarEvent } from '@/src/features/google-calendar/utils/googleCalendar';
import { createDate } from '@/src/utils/timezone';

// Validation schema for therapist session scheduling
const ScheduleSessionSchema = z.object({
  clientId: z.number(),
  sessionStartTime: z.string(),
  sessionEndTime: z.string(),
  timezone: z.string(),
}); 

export async function POST(req: NextRequest) {
  try {
    auth.protect();
    const currentUserData = await currentUser();
    if (!currentUserData?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = ScheduleSessionSchema.parse(body);

    // Get the therapist's user record
    const therapistUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, currentUserData.id),
    });

    if (!therapistUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the therapist record
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.userId, therapistUser.id),
    });

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Get the client user record
    const client = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, validatedData.clientId),
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Verify that this client has previously booked with this therapist
    const existingBooking = await db.query.bookingSessions.findFirst({
      where: (bookings, { eq, and }) =>
        and(eq(bookings.userId, validatedData.clientId), eq(bookings.therapistId, therapist.id)),
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'You can only schedule sessions with existing clients' },
        { status: 403 },
      );
    }

    // Convert session times to proper Date objects
    const sessionStartTime = createDate(validatedData.sessionStartTime, validatedData.timezone);
    const sessionEndTime = createDate(validatedData.sessionEndTime, validatedData.timezone);

    // Validate that the session is in the future
    const now = createDate(new Date(), validatedData.timezone);
    if (sessionStartTime <= now) {
      return NextResponse.json(
        { error: 'Session must be scheduled for a future time' },
        { status: 400 },
      );
    }

    // Check for conflicts with existing sessions
    const conflictingSession = await db.query.bookingSessions.findFirst({
      where: (bookings, { eq, and, or, gte, lte }) =>
        and(
          eq(bookings.therapistId, therapist.id),
          or(
            eq(bookings.status, 'pending'),
            eq(bookings.status, 'confirmed'),
            eq(bookings.status, 'scheduled'),
          ),
          or(
            // New session starts during existing session
            and(
              gte(bookings.sessionStartTime, sessionStartTime.toJSDate()),
              lte(bookings.sessionStartTime, sessionEndTime.toJSDate()),
            ),
            // New session ends during existing session
            and(
              gte(bookings.sessionEndTime, sessionStartTime.toJSDate()),
              lte(bookings.sessionEndTime, sessionEndTime.toJSDate()),
            ),
            // New session completely contains existing session
            and(
              lte(bookings.sessionStartTime, sessionStartTime.toJSDate()),
              gte(bookings.sessionEndTime, sessionEndTime.toJSDate()),
            ),
          ),
        ),
    });

    if (conflictingSession) {
      return NextResponse.json(
        { error: 'This time slot conflicts with an existing session' },
        { status: 409 },
      );
    }

    // Create the booking session
    const bookingResult = await db
      .insert(bookingSessions)
      .values({
        userId: validatedData.clientId,
        therapistId: therapist.id,
        sessionDate: sessionStartTime.toJSDate(),
        sessionStartTime: sessionStartTime.toJSDate(),
        sessionEndTime: sessionEndTime.toJSDate(),
        status: 'confirmed',
        metadata: {
          clientTimezone: validatedData.timezone,
          therapistTimezone: validatedData.timezone, // Assuming therapist is scheduling in their timezone
          scheduledByTherapist: true,
        },
      })
      .returning();

    const booking = bookingResult[0];

    // Create Google Calendar event if therapist has integration
    let calendarResult = null;
    if (
      therapist.googleCalendarAccessToken &&
      therapist.googleCalendarIntegrationStatus === 'connected'
    ) {
      try {
        calendarResult = await createAndStoreGoogleCalendarEvent({
          booking: {
            ...booking,
            userId: booking.userId.toString(),
          },
          therapist: {
            ...therapist,
            email: therapistUser.email,
          },
          user: {
            ...client,
            therapistId: null,
          },
          db,
        });
      } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        // Continue without calendar event - the session is still created
      }
    }

    // Send confirmation emails
    try {
      await sendBookingConfirmationEmail({
        clientEmail: client.email,
        therapistEmail: therapist.googleCalendarEmail || therapistUser.email,
        sessionDate: sessionStartTime.toFormat('yyyy-MM-dd'),
        sessionTime: sessionStartTime.toFormat('HH:mm'),
        clientTimezone: validatedData.timezone as SupportedTimezone,
        therapistTimezone: validatedData.timezone as SupportedTimezone,
        googleMeetLink: calendarResult?.googleMeetLink,
        therapistName: therapist.name,
        clientName: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Continue without email - the session is still created
    }

    return NextResponse.json({
      success: true,
      message: 'Session scheduled successfully',
      booking: {
        id: booking.id,
        sessionDate: booking.sessionDate,
        sessionStartTime: booking.sessionStartTime,
        sessionEndTime: booking.sessionEndTime,
        status: booking.status,
        clientTimezone: validatedData.timezone,
        therapistTimezone: validatedData.timezone,
        googleCalendarEventId: calendarResult?.eventId || null,
        googleCalendarEventLink: calendarResult?.eventLink || null,
        googleMeetLink: calendarResult?.googleMeetLink || null,
      },
    });
  } catch (error) {
    console.error('Error scheduling session:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to schedule session',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
