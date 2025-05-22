import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users, bookingSessions } from '@/src/db/schema';

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
    // Fetch clients for this therapist (users who have booked with this therapist)
    const clientUserIdsResult = await db
      .select({ userId: bookingSessions.userId })
      .from(bookingSessions)
      .where(eq(bookingSessions.therapistId, therapistResult[0].id));
    const uniqueClientUserIds = [...new Set(clientUserIdsResult.map((row) => row.userId))];
    let clients: Array<{ id: string; firstName: string; lastName?: string; email: string }> = [];
    if (uniqueClientUserIds.length > 0) {
      const clientsResult = await db
        .select({
          id: users.clerkId,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(users)
        .where(
          // @ts-ignore
          users.id.in(uniqueClientUserIds),
        );
      clients = clientsResult.map((client) => ({
        id: client.id,
        firstName: client.firstName || '',
        lastName: client.lastName || undefined,
        email: client.email || '',
      }));
    }
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error fetching therapist clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
