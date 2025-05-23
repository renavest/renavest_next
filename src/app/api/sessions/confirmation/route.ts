import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { SUPPORTED_TIMEZONES } from '@/src/features/booking/utils/dateTimeUtils';

// Define a type for booking metadata
type BookingMetadata = {
  googleMeetLink?: string;
  clientTimezone?: string;
  therapistTimezone?: string;
};

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUserId = user.id;
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get the database user ID from the Clerk user ID
    const dbUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, clerkUserId),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Fetching booking with:', {
      bookingId: parseInt(bookingId),
      clerkUserId,
      dbUserId: dbUser.id,
    });

    const booking = await db.query.bookingSessions.findFirst({
      where: (bookings, { eq }) => eq(bookings.id, parseInt(bookingId)),
      with: {
        therapist: {
          columns: {
            name: true,
          },
        },
        user: {
          columns: {
            clerkId: true,
            email: true,
          },
        },
      },
    });

    console.log('Booking found:', booking ? 'Yes' : 'No');
    console.log('Booking user ID:', booking?.userId);
    console.log('Current user ID:', dbUser.id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Compare database user IDs
    if (booking.userId !== dbUser.id) {
      console.warn('Booking does not belong to the current user');
      return NextResponse.json({ error: 'Unauthorized access to booking' }, { status: 403 });
    }

    const meta = booking.metadata as BookingMetadata | undefined;

    // Safely extract timezones from metadata if available
    let clientTimezone = 'UTC';
    let therapistTimezone = 'UTC';
    if (meta) {
      clientTimezone = meta.clientTimezone || 'UTC';
      therapistTimezone = meta.therapistTimezone || 'UTC';
    }

    // Only allow supported timezones for frontend display
    const supportedTimezones = Object.keys(SUPPORTED_TIMEZONES);
    if (!supportedTimezones.includes(clientTimezone)) {
      clientTimezone = 'America/New_York';
    }
    if (!supportedTimezones.includes(therapistTimezone)) {
      therapistTimezone = 'America/New_York';
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        therapist: {
          name: booking.therapist?.name || 'Unknown Therapist',
          email: booking.user?.email || '',
        },
        sessionDate: booking.sessionDate,
        sessionStartTime: booking.sessionStartTime,
        sessionEndTime: booking.sessionEndTime,
        status: booking.status,
        googleMeetLink: meta?.googleMeetLink || '',
        clientTimezone,
        therapistTimezone,
      },
    });
  } catch (error) {
    console.error('Error fetching booking confirmation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
