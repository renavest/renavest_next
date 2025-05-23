import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users, pendingTherapists } from '@/src/db/schema';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Therapist ID is required' }, { status: 400 });
    }

    // Check if this is a pending therapist (prefixed with "pending-")
    if (id.startsWith('pending-')) {
      const pendingId = parseInt(id.replace('pending-', ''));
      if (isNaN(pendingId)) {
        return NextResponse.json({ error: 'Invalid pending therapist ID' }, { status: 400 });
      }

      // Fetch pending therapist data
      const pendingTherapist = await db.query.pendingTherapists.findFirst({
        where: eq(pendingTherapists.id, pendingId),
        columns: {
          id: true,
          name: true,
          clerkEmail: true,
          bookingURL: true,
        },
      });

      if (!pendingTherapist) {
        return NextResponse.json({ error: 'Pending therapist not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: `pending-${pendingTherapist.id}`,
        name: pendingTherapist.name,
        email: pendingTherapist.clerkEmail,
        bookingURL: pendingTherapist.bookingURL,
        isPending: true,
      });
    } else {
      // Handle active therapist
      const therapistId = parseInt(id);
      if (isNaN(therapistId)) {
        return NextResponse.json({ error: 'Invalid therapist ID' }, { status: 400 });
      }

      // Fetch therapist data with user information
      const therapist = await db.query.therapists.findFirst({
        where: eq(therapists.id, therapistId),
        columns: {
          id: true,
          name: true,
          userId: true,
          bookingURL: true,
        },
      });

      if (!therapist) {
        return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
      }

      // Get the user data for the therapist
      const therapistUser = await db.query.users.findFirst({
        where: eq(users.id, therapist.userId),
        columns: {
          email: true,
        },
      });

      if (!therapistUser) {
        return NextResponse.json({ error: 'Therapist user not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: therapist.id.toString(),
        name: therapist.name,
        email: therapistUser.email,
        bookingURL: therapist.bookingURL,
        isPending: false,
      });
    }
  } catch (error) {
    console.error('Error fetching therapist details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
