import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';
import { createAndStoreGoogleCalendarEvent } from '@/src/utils/googleCalendar';

const CreateCalendarEventSchema = z.object({
  bookingSessionId: z.number(),
});

async function fetchBookingSessionDetails(bookingSessionId: number) {
  return db.query.bookingSessions.findFirst({
    where: eq(bookingSessions.id, bookingSessionId),
    with: {
      therapist: {
        columns: {
          id: true,
          googleCalendarAccessToken: true,
          googleCalendarRefreshToken: true,
          googleCalendarEmail: true,
          googleCalendarIntegrationStatus: true,
        },
      },
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

export async function POST(req: NextRequest) {
  // Clerk auth
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  // Parse and validate body
  const body = await req.json();
  const parseResult = CreateCalendarEventSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid request', errors: parseResult.error.errors },
      { status: 400 },
    );
  }
  const { bookingSessionId } = parseResult.data;
  // Fetch booking session
  const bookingSession = await fetchBookingSessionDetails(bookingSessionId);
  if (!bookingSession) {
    return NextResponse.json(
      { success: false, message: 'Booking session not found' },
      { status: 404 },
    );
  }
  // Only allow therapist to create event for their own session
  if (bookingSession.therapist.id !== parseInt(userId)) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }
  // Check Google Calendar integration
  if (
    !bookingSession.therapist.googleCalendarAccessToken ||
    bookingSession.therapist.googleCalendarIntegrationStatus !== 'connected'
  ) {
    return NextResponse.json(
      { success: false, message: 'Google Calendar not integrated for this therapist' },
      { status: 400 },
    );
  }
  // Use shared utility for Google Calendar event creation
  try {
    const result = await createAndStoreGoogleCalendarEvent({
      booking: bookingSession,
      therapist: bookingSession.therapist,
      user: bookingSession.user,
      db,
    });
    return NextResponse.json({
      success: true,
      message: 'Google Calendar event created',
      eventId: result.eventId,
      eventLink: result.eventLink,
      googleMeetLink: result.googleMeetLink,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create Google Calendar event',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
