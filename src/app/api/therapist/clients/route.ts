import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users } from '@/src/db/schema';

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;

    // Find the therapist ID associated with the current user's email
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

    // Fetch clients for this therapist
    const clients = await db
      .select({
        id: users.clerkId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.therapistId, therapistResult[0].id));

    return NextResponse.json({
      clients: clients.map((client) => ({
        id: client.id,
        firstName: client.firstName || '',
        lastName: client.lastName || undefined,
        email: client.email || '',
      })),
    });
  } catch (error) {
    console.error('Error fetching therapist clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
