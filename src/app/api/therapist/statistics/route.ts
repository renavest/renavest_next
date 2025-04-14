import { currentUser } from '@clerk/nextjs/server';
import { eq, count } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { bookingSessions, therapists } from '@/src/db/schema';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the therapist ID associated with the current user's email
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const therapistResult = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.email, userEmail))
      .limit(1);

    if (!therapistResult.length) {
      console.error('Therapist not found for email:', {
        userEmail: userEmail,
      });
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const therapistId = therapistResult[0].id;

    // Fetch total sessions
    const totalSessionsResult = await db
      .select({ count: count() })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));

    // Fetch total clients (unique users)
    const totalClientsResult = await db
      .selectDistinct({ count: count() })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));

    // Fetch completed sessions
    const completedSessionsResult = await db
      .select({ count: count() })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistId));

    return NextResponse.json({
      statistics: {
        totalSessions: totalSessionsResult[0]?.count ?? 0,
        totalClients: totalClientsResult[0]?.count ?? 0,
        completedSessions: completedSessionsResult[0]?.count ?? 0,
      },
    });
  } catch (error) {
    console.error('Error fetching therapist statistics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
