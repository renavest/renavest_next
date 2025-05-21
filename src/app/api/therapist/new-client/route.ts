import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/src/db';
import { therapists, users } from '@/src/db/schema';

// Validation schema for creating a new client
const CreateClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    // Authenticate the therapist
    const { userId, sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as { role?: string } | undefined;
    if (!userId || metadata?.role !== 'therapist') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the therapist's ID
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);
    if (!userResult.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const therapist = await db.query.therapists.findFirst({
      where: eq(therapists.userId, userResult[0].id),
    });
    if (!therapist) {
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
        therapistId: therapist.id,
        firstName: validatedInput.firstName,
        lastName: validatedInput.lastName,
      },
      notify: true,
    });

    console.log('Invitation created:', invitation);

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

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error('Error creating new client:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
