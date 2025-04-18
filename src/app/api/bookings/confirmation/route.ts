import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';

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

    const booking = await db.query.bookingSessions.findFirst({
      where: (bookings, { eq, and }) =>
        and(eq(bookings.id, parseInt(bookingId)), eq(bookings.userId, userId)),
      with: {
        therapist: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
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
