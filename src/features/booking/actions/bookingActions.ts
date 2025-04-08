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
      // More flexible date validation
      try {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date >= new Date(new Date().toDateString());
      } catch {
        return false;
      }
    },
    { message: 'Invalid date' },
  ),
  sessionStartTime: z.string().refine(
    (val) => {
      // Accept time in HH:MM format or full datetime
      return (
        /^([01]\d|2[0-3]):([0-5]\d)$/.test(val) ||
        /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):([0-5]\d)/.test(val)
      );
    },
    { message: 'Invalid time format' },
  ),
  userEmail: z.string().email(),
});

export async function createBookingSession(rawData: unknown) {
  // Validate input
  const result = BookingSessionSchema.safeParse(rawData);

  if (!result.success) {
    console.error('Validation Errors:', result.error.errors);
    throw new Error(`Invalid booking data: ${JSON.stringify(result.error.errors)}`);
  }

  const { userId, therapistId, sessionDate, sessionStartTime, userEmail } = result.data;

  // Normalize date and time
  let normalizedDate;
  if (sessionStartTime.includes('T')) {
    // Full datetime provided
    normalizedDate = new Date(sessionStartTime);
  } else {
    // Separate date and time
    normalizedDate = new Date(`${sessionDate}T${sessionStartTime}`);
  }

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
        sessionDate: normalizedDate,
        sessionStartTime: normalizedDate,
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
