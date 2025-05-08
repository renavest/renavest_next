'use server';

import { DateTime } from 'luxon';
import { z } from 'zod';

import PostHogClient from '@/posthog';
import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';

import {
  TimezoneIdentifier,
  parseDateTime,
  formatDateTime,
  SUPPORTED_TIMEZONES,
} from '../utils/dateTimeUtils';
import { ensureUserInDb } from '../utils/ensureUserInDb';

import { sendBookingConfirmationEmail } from './sendBookingConfirmationEmail';

// Validation schema
const BookingSessionSchema = z.object({
  userId: z.string(),
  therapistId: z.union([z.string(), z.number()]).transform(String),
  sessionDate: z.string(),
  sessionStartTime: z.string(),
  userEmail: z.string().email(),
  timezone: z.string().transform((val) => {
    // Timezone abbreviation to IANA timezone mapping
    const timezoneMap: Record<string, TimezoneIdentifier> = {
      EST: 'America/New_York',
      EDT: 'America/New_York',
      CST: 'America/Chicago',
      CDT: 'America/Chicago',
      PST: 'America/Los_Angeles',
      PDT: 'America/Los_Angeles',
      MST: 'America/Denver',
      MDT: 'America/Denver',
    };

    // If it's a known abbreviation, return the mapped timezone
    if (timezoneMap[val]) return timezoneMap[val];

    // If it's already a supported timezone, return it
    if (Object.keys(SUPPORTED_TIMEZONES).includes(val)) return val as TimezoneIdentifier;

    // If no match, default to America/New_York with a warning
    console.warn(`Unsupported timezone: ${val}. Defaulting to America/New_York`);
    return 'America/New_York';
  }),
});

// Helper to fetch user and therapist details
async function fetchUserAndTherapist(userEmail: string, therapistId: string | number) {
  const parsedTherapistId = typeof therapistId === 'string' ? parseInt(therapistId) : therapistId;

  // Ensure user exists in DB (by email)
  const user = await ensureUserInDb({ email: userEmail });

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
  sessionDate: DateTime;
  userEmail: string;
}) {
  // Calculate end time (1 hour after start time)
  const sessionEndTime = data.sessionDate.plus({ hours: 1 });

  return db
    .insert(bookingSessions)
    .values({
      userId: data.userId,
      therapistId: data.therapistId,
      sessionDate: data.sessionDate.toJSDate(),
      sessionStartTime: data.sessionDate.toJSDate(),
      sessionEndTime: sessionEndTime.toJSDate(),
      status: 'scheduled',
      metadata: {
        calendlyEventData: null,
        userEmail: data.userEmail,
      },
    })
    .returning();
}

export async function createBookingSession(rawData: unknown) {
  console.log('rawData', rawData);
  try {
    const validatedData = BookingSessionSchema.parse(rawData);
    console.log('validatedData', validatedData);
    const { therapistId, sessionDate, sessionStartTime, userEmail, timezone } = validatedData;

    // Parse the date and time in the specified timezone
    const sessionDateTime = parseDateTime(sessionDate, sessionStartTime, timezone);

    const { user, advisor, parsedTherapistId } = await fetchUserAndTherapist(
      userEmail,
      therapistId,
    );

    // Create booking record with UTC timestamp
    const bookingSession = await createBookingRecord({
      userId: user.clerkId,
      therapistId: parsedTherapistId,
      sessionDate: sessionDateTime,
      userEmail,
    });

    // Fetch the booking session with metadata to get the Google Meet link
    const bookingSessionId = bookingSession[0]?.id;
    let googleMeetLink = '';
    if (bookingSessionId) {
      const bookingWithMeta = await db.query.bookingSessions.findFirst({
        where: (bookings, { eq }) => eq(bookings.id, bookingSessionId),
      });
      const meta = bookingWithMeta?.metadata as { googleMeetLink?: string } | undefined;
      googleMeetLink = meta?.googleMeetLink || '';
    }

    // Format the date and time for email
    const { date: formattedDate, time: formattedTime } = formatDateTime(sessionDateTime, timezone);

    // Send confirmation emails
    const emailResult = await sendBookingConfirmationEmail({
      clientName: `${user.firstName} ${user.lastName}`.trim(),
      clientEmail: userEmail,
      therapistName: advisor.name || 'Renavest Therapist',
      therapistEmail: advisor.email || 'seth@renavestapp.com',
      sessionDate: formattedDate,
      sessionTime: formattedTime,
      timezone: timezone,
      googleMeetLink,
    });

    // Track in PostHog
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
        session_date: sessionDateTime.toISO(),
        session_start_time: sessionStartTime,
        timezone: timezone,
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
