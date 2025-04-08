'use server';

import posthog from 'posthog-js';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';

// Validation schema
const BookingSessionSchema = z.object({
  userId: z.string(),
  therapistId: z.string(),
  sessionDate: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date >= new Date();
    },
    { message: 'Invalid date' },
  ),
  sessionStartTime: z.string().refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
    message: 'Invalid time format (HH:MM)',
  }),
  userEmail: z.string().email(),
});

export async function createBookingSession(rawData: unknown) {
  // Validate input
  const result = BookingSessionSchema.safeParse(rawData);

  if (!result.success) {
    throw new Error(`Invalid booking data: ${result.error.message}`);
  }

  const { userId, therapistId, sessionDate, sessionStartTime, userEmail } = result.data;

  try {
    // Fetch therapist details for additional tracking
    const therapist = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.id, parseInt(therapistId)),
    });

    // Insert booking session
    const bookingSession = await db
      .insert(bookingSessions)
      .values({
        userId: parseInt(userId),
        therapistId: parseInt(therapistId),
        sessionDate: new Date(`${sessionDate}T${sessionStartTime}:00`),
        sessionStartTime: new Date(`${sessionDate}T${sessionStartTime}:00`),
        status: 'scheduled',
        metadata: {
          calendlyEventData: null,
          userEmail: userEmail,
        },
      })
      .returning();

    // PostHog tracking
    posthog.capture('therapist_session_booked', {
      therapist_id: therapistId,
      therapist_name: therapist?.name,
      user_id: userId,
      user_email: userEmail,
      session_date: sessionDate,
      session_start_time: sessionStartTime,
    });

    return {
      success: true,
      message: 'Booking session created successfully',
      sessionId: bookingSession[0]?.id,
    };
  } catch (error) {
    console.error('Error creating booking session:', error);
    throw new Error('Failed to create booking session');
  }
}
