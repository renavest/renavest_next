'use server';

import { z } from 'zod';

import PostHogClient from '@/posthog'; // Ensure this is a server-side PostHog client
import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';

import { sendBookingConfirmationEmail } from './sendBookingConfirmationEmail';

// Validation schema
const BookingSessionSchema = z.object({
  userId: z.string(),
  therapistId: z.string(),
  sessionDate: z.string(),
  sessionStartTime: z.string(),
  userEmail: z.string().email(),
  therapistEmail: z.string().email(),
  timezone: z.string().optional().default('EST'),
});

// Helper function to parse and normalize time
function normalizeDateTime(sessionTimestamp: string): Date {
  const normalizedDate = new Date(sessionTimestamp);

  // Validate the date
  if (isNaN(normalizedDate.getTime())) {
    throw new Error('Invalid date');
  }

  // Ensure date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (normalizedDate < today) {
    throw new Error('Booking date cannot be in the past');
  }

  return normalizedDate;
}

export async function createBookingSession(rawData: unknown) {
  // Log the raw input data for debugging
  console.log('Raw Booking Session Input:', JSON.stringify(rawData, null, 2));

  // Validate input
  const result = BookingSessionSchema.safeParse(rawData);

  if (!result.success) {
    // More descriptive error logging
    console.error('Validation Errors:', JSON.stringify(result.error.errors, null, 2));

    // Provide a more user-friendly error message
    const errorMessages = result.error.errors.map((e) => {
      switch (e.path[0]) {
        case 'timezone':
          return 'Timezone is required. Please select a valid timezone.';
        case 'therapistId':
          return 'Invalid therapist selection.';
        case 'sessionDate':
          return 'Invalid session date.';
        case 'sessionStartTime':
          return 'Invalid session start time.';
        case 'userEmail':
          return 'Invalid email address.';
        default:
          return e.message;
      }
    });

    throw new Error(`Booking validation failed: ${errorMessages.join(', ')}`);
  }

  const { therapistId, sessionDate, sessionStartTime, userEmail, timezone } = result.data;

  // Additional logging for each field
  console.log('Parsed Booking Session Details:', {
    therapistId,
    sessionDate,
    sessionStartTime,
    userEmail,
    timezone,
    therapistIdType: typeof therapistId,
  });

  // Normalize date and time
  let normalizedDate;
  try {
    normalizedDate = normalizeDateTime(sessionDate);
  } catch (error) {
    console.error('Date parsing error:', error);
    throw new Error(
      `Invalid date format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  try {
    // No need to parse userId to integer anymore
    const parsedTherapistId = parseInt(therapistId);

    // Find the user by email
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, userEmail),
    });

    if (!user) {
      throw new Error(`User with email ${userEmail} not found`);
    }

    // Fetch therapist details
    const advisor = await db.query.therapists.findFirst({
      where: (therapists, { eq }) => eq(therapists.id, parsedTherapistId),
    });

    if (!advisor) {
      throw new Error(`Therapist with ID ${therapistId} not found`);
    }

    // Insert booking session
    const bookingSession = await db
      .insert(bookingSessions)
      .values({
        userId: user.clerkId, // Use the Clerk ID from the found user
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

    // Send confirmation emails
    const emailResult = await sendBookingConfirmationEmail({
      clientName: `${user.firstName} ${user.lastName}`.trim(),
      clientEmail: userEmail,
      therapistName: advisor.name || 'Renavest Therapist',
      therapistEmail: 'seth@renavestapp.com',
      sessionDate: normalizedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      sessionTime:
        normalizedDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }) + ` ${timezone}`,
      timezone: timezone,
    });

    // PostHog tracking
    const posthogClient = PostHogClient();
    posthogClient.capture({
      distinctId: user.clerkId,
      event: 'therapist_session_booked',
      properties: {
        $set_once: {
          email: userEmail,
          first_name: user.firstName,
          last_name: user.lastName,
          clerk_id: user.clerkId,
        },
        therapist_id: therapistId,
        therapist_name: advisor?.name,
        user_id: user.clerkId,
        user_email: userEmail,
        session_date: sessionDate,
        session_start_time: sessionStartTime,
        email_sent: emailResult.success,
      },
    });

    // Close the PostHog client to ensure tracking
    await posthogClient.shutdown();

    return {
      success: true,
      message: 'Booking session created successfully',
      sessionId: bookingSession[0]?.id,
      emailSent: emailResult.success,
    };
  } catch (error) {
    console.error('Error creating booking session:', error);
    throw new Error(
      `Failed to create booking session: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
