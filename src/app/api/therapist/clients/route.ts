import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import {
  getTherapistByEmail,
  getClientsData,
  invalidateOnDataChange,
} from '@/src/services/therapistDataService';

// Validation schema for creating a new client
const CreateClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
});

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
    if (!userEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Use optimized therapist lookup with caching
    const therapistLookup = await getTherapistByEmail(userEmail);
    if (!therapistLookup) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Use cached clients data
    const clientsData = await getClientsData(therapistLookup.therapistId);

    return NextResponse.json(clientsData, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
      },
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

export async function POST(request: NextRequest) {
  try {
    // Authenticate the therapist
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
    if (!userEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Use optimized therapist lookup with caching
    const therapistLookup = await getTherapistByEmail(userEmail);
    if (!therapistLookup) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    // Parse and validate input
    const body = await request.json();
    const validatedInput = CreateClientSchema.parse(body);

    // Check if user with this email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedInput.email),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    // Invite user in Clerk
    const invitation = await (
      await clerkClient()
    ).invitations.createInvitation({
      emailAddress: validatedInput.email,
      publicMetadata: {
        therapistId: therapistLookup.therapistId,
        firstName: validatedInput.firstName,
        lastName: validatedInput.lastName,
      },
      notify: true,
    });

    // Create new user in our database
    const newUser = await db
      .insert(users)
      .values({
        clerkId: invitation.id,
        firstName: validatedInput.firstName,
        lastName: validatedInput.lastName,
        email: validatedInput.email,
      })
      .returning();

    // Invalidate clients cache
    await invalidateOnDataChange(therapistLookup.therapistId, 'client');

    return NextResponse.json({ client: newUser[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating new client:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
