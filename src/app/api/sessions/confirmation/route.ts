import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    console.log('Fetching booking with:', {
      bookingId: parseInt(bookingId),
      userId,
    });

    const booking = await db.query.bookingSessions.findFirst({
      where: (bookings, { eq }) => eq(bookings.id, parseInt(bookingId)),
      with: {
        therapist: {
          columns: {
            name: true,
            email: true,
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
    console.log('Booking user:', booking?.user?.clerkId);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId !== userId) {
      console.warn('Booking does not belong to the current user');
      return NextResponse.json({ error: 'Unauthorized access to booking' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        therapist: {
          name: booking.therapist.name,
          email: booking.therapist.email,
        },
        sessionDate: booking.sessionDate,
        sessionStartTime: booking.sessionStartTime,
        sessionEndTime: booking.sessionEndTime,
        status: booking.status,
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
