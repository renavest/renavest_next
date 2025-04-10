'use server';

import { z } from 'zod';

import PostHogClient from '@/posthog'; // Ensure this is a server-side PostHog client
import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';

import { sendBookingConfirmationEmail } from './sendBookingConfirmationEmail';

// Validation schema
const BookingSessionSchema = z.object({
  userId: z.string(),
  therapistId: z.union([z.string(), z.number()]).transform(String),
  sessionDate: z.string(),
  sessionStartTime: z.string(),
  userEmail: z.string().email(),
  timezone: z.string().optional().default('EST'),
  therapistEmail: z.string().email().optional().default('seth@renavestapp.com'),
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

// Helper to validate and parse input data
async function validateAndParseInput(rawData: unknown) {
  const result = BookingSessionSchema.safeParse(rawData);
  if (!result.success) {
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
  return result.data;
}

// Helper to fetch user and therapist details
async function fetchUserAndTherapist(userEmail: string, therapistId: string | number) {
  const parsedTherapistId = typeof therapistId === 'string' ? parseInt(therapistId) : therapistId;

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, userEmail),
  });
  if (!user) {
    throw new Error(`User with email ${userEmail} not found`);
  }

  const advisor = await db.query.therapists.findFirst({
    where: (therapists, { eq }) => eq(therapists.id, parsedTherapistId),
  });
  if (!advisor) {
    throw new Error(`Therapist with ID ${therapistId} not found`);
  }

  return { user, advisor, parsedTherapistId };
}

// Helper to create booking record
async function createBookingRecord(data: {
  userId: string;
  therapistId: number;
  sessionDate: Date;
  userEmail: string;
}) {
  return db
    .insert(bookingSessions)
    .values({
      userId: data.userId,
      therapistId: data.therapistId,
      sessionDate: data.sessionDate,
      sessionStartTime: data.sessionDate,
      status: 'scheduled',
      metadata: {
        calendlyEventData: null,
        userEmail: data.userEmail,
      },
    })
    .returning();
}

export async function createBookingSession(rawData: unknown) {
  try {
    // Validate and parse input
    const validatedData = await validateAndParseInput(rawData);
    const { therapistId, sessionDate, sessionStartTime, userEmail, timezone, therapistEmail } =
      validatedData;

    // Normalize date
    const normalizedDate = normalizeDateTime(sessionDate);

    // Fetch user and therapist details
    const { user, advisor, parsedTherapistId } = await fetchUserAndTherapist(
      userEmail,
      therapistId,
    );

    // Create booking record
    const bookingSession = await createBookingRecord({
      userId: user.clerkId,
      therapistId: parsedTherapistId,
      sessionDate: normalizedDate,
      userEmail,
    });

    // Send confirmation emails
    const emailResult = await sendBookingConfirmationEmail({
      clientName: `${user.firstName} ${user.lastName}`.trim(),
      clientEmail: userEmail,
      therapistName: advisor.name || 'Renavest Therapist',
      therapistEmail: therapistEmail,
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
      timezone,
    });

    // Track event in PostHog
    const posthogClient = PostHogClient();
    await posthogClient.capture({
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
