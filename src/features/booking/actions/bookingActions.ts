'use server';

import { z } from 'zod';

import PostHogClient from '@/posthog'; // Ensure this is a server-side PostHog client
import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';

// Validation schema
const BookingSessionSchema = z.object({
  userId: z.string(),
  therapistId: z.string(),
  sessionDate: z.string(),
  sessionStartTime: z.string(),
  userEmail: z.string().email(),
});

export async function createBookingSession(rawData: unknown) {
  // Log the raw input data for debugging
  console.log('Raw Booking Session Input:', JSON.stringify(rawData, null, 2));

  // Validate input
  const result = BookingSessionSchema.safeParse(rawData);

  if (!result.success) {
    console.error('Validation Errors:', JSON.stringify(result.error.errors, null, 2));
    throw new Error(`Invalid booking data: ${JSON.stringify(result.error.errors)}`);
  }

  const { userId, therapistId, sessionDate, sessionStartTime, userEmail } = result.data;

  // Additional logging for each field
  console.log('Parsed Booking Session Details:', {
    userId,
    therapistId,
    sessionDate,
    sessionStartTime,
    userEmail,
    userIdType: typeof userId,
    therapistIdType: typeof therapistId,
  });

  // Normalize date and time
  let normalizedDate;
  try {
    // Try parsing the full datetime first
    normalizedDate = new Date(sessionStartTime);

    // If that fails, try combining date and time
    if (isNaN(normalizedDate.getTime())) {
      normalizedDate = new Date(`${sessionDate}T${sessionStartTime}`);
    }

    // Validate the date
    if (isNaN(normalizedDate.getTime())) {
      throw new Error('Invalid date');
    }
  } catch (error) {
    console.error('Date parsing error:', error);
    throw new Error('Invalid date format');
  }

  try {
    // No need to parse userId to integer anymore
    const parsedTherapistId = parseInt(therapistId);

    // Log parsed IDs
    console.log('Parsed IDs:', {
      userId,
      parsedTherapistId,
      isTherapistIdNaN: isNaN(parsedTherapistId),
    });

    // Fetch therapist details for additional tracking
    const advisor = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.id, parsedTherapistId),
    });

    // Insert booking session
    const bookingSession = await db
      .insert(bookingSessions)
      .values({
        userId: userId, // Use Clerk ID directly
        therapistId: parsedTherapistId,
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
    const posthogClient = PostHogClient();
    posthogClient.capture({
      distinctId: userId,
      event: 'therapist_session_booked',
      properties: {
        therapist_id: therapistId,
        therapist_name: advisor?.name,
        user_id: userId,
        user_email: userEmail,
        session_date: sessionDate,
        session_start_time: sessionStartTime,
      },
    });

    // Close the PostHog client to ensure tracking
    await posthogClient.shutdown();

    return {
      success: true,
      message: 'Booking session created successfully',
      sessionId: bookingSession[0]?.id,
    };
  } catch (error) {
    console.error('Error creating booking session:', error);
    throw new Error(
      `Failed to create booking session: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
