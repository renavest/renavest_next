import { auth, currentUser } from '@clerk/nextjs/server';
import { eq, gt, and, or } from 'drizzle-orm';
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

    // Find the user ID associated with the current user's email
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);
    if (!userResult.length) {
      console.error('User not found for email:', { userEmail });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const therapistResult = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.userId, userResult[0].id))
      .limit(1);
    if (!therapistResult.length) {
      console.error('Therapist not found for userId:', { userId: userResult[0].id });
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Fetch upcoming sessions for this therapist
    const now = new Date();
    const sessions = await db
      .select({
        id: bookingSessions.id,
        clientId: bookingSessions.userId,
        clientName: users.firstName,
        clientLastName: users.lastName,
        sessionDate: bookingSessions.sessionDate,
        sessionStartTime: bookingSessions.sessionStartTime,
        status: bookingSessions.status,
        metadata: bookingSessions.metadata,
      })
      .from(bookingSessions)
      .leftJoin(users, eq(bookingSessions.userId, users.id))
      .where(
        and(
          eq(bookingSessions.therapistId, therapistResult[0].id),
          or(
            eq(bookingSessions.status, 'pending'),
            eq(bookingSessions.status, 'confirmed'),
            eq(bookingSessions.status, 'scheduled'),
          ),
          gt(bookingSessions.sessionDate, now),
        ),
      )
      .orderBy(bookingSessions.sessionDate)
      .limit(10);

    console.log('Fetched Sessions:', sessions);

    return NextResponse.json({
      sessions: sessions.map((session) => {
        // Extract timezone and Google Meet link from metadata
        const sessionMetadata = session.metadata as {
          therapistTimezone?: string;
          clientTimezone?: string;
          googleMeetLink?: string;
        } | null;

        return {
          id: session.id.toString(),
          clientId: session.clientId,
          clientName: `${session.clientName || ''} ${session.clientLastName || ''}`.trim(),
          sessionDate: session.sessionDate,
          sessionStartTime: session.sessionStartTime,
          status: session.status,
          therapistTimezone: sessionMetadata?.therapistTimezone || 'UTC',
          clientTimezone: sessionMetadata?.clientTimezone || 'UTC',
          googleMeetLink: sessionMetadata?.googleMeetLink || '',
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching therapist sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
