import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { bookingSessions, therapists, users } from '@/src/db/schema';

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    if (!userId || metadata?.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only fetch full user if needed (for email)
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

    // Fetch upcoming sessions for this therapist
    const sessions = await db
      .select({
        id: bookingSessions.id,
        clientId: bookingSessions.userId,
        clientName: users.firstName,
        clientLastName: users.lastName,
        sessionDate: bookingSessions.sessionDate,
        sessionStartTime: bookingSessions.sessionStartTime,
        status: bookingSessions.status,
      })
      .from(bookingSessions)
      .leftJoin(users, eq(bookingSessions.userId, users.clerkId))
      .where(eq(bookingSessions.therapistId, therapistResult[0].id))
      .orderBy(desc(bookingSessions.sessionDate))
      .limit(10);

    console.log('Fetched Sessions:', sessions);

    return NextResponse.json({
      sessions: sessions.map((session) => ({
        id: session.id.toString(),
        clientId: session.clientId,
        clientName: `${session.clientName || ''} ${session.clientLastName || ''}`.trim(),
        sessionDate: session.sessionDate,
        sessionStartTime: session.sessionStartTime,
        status: session.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching therapist sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
