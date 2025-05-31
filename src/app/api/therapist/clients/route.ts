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

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userResult = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);

    if (!userResult.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const therapistResult = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userResult[0].id))
      .limit(1);

    if (!therapistResult.length) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const therapistId = therapistResult[0].id;

    // Get all clients who have had sessions with this therapist
    const clientsResult = await db
      .selectDistinct({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        imageUrl: users.imageUrl,
      })
      .from(users)
      .innerJoin(bookingSessions, eq(users.id, bookingSessions.userId))
      .where(eq(bookingSessions.therapistId, therapistId))
      .orderBy(users.firstName, users.lastName);

    // Format clients for response
    const clients = clientsResult.map((client) => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      imageUrl: client.imageUrl,
      fullName: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email,
    }));

    return NextResponse.json({
      clients,
      total: clients.length,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch clients',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
