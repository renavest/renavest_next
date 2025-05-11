import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Extensive logging for debugging
    console.log('Verify Therapist Request Details:', {
      email,
      fullUrl: request.url,
      headers: Object.fromEntries(request.headers),
    });

    // Check if the user is authenticated
    const { userId, sessionId, getToken } = await auth();

    console.log('Authentication Context:', {
      userId,
      sessionId,
      hasGetToken: !!getToken,
    });

    // If no userId, return unauthorized
    if (!userId) {
      console.log('No user ID found - returning unauthorized');
      return NextResponse.json({ error: 'Unauthorized', details: 'No user ID' }, { status: 401 });
    }

    // Check if the therapist exists in the therapists table
    const therapistResult = await db
      .select({ id: therapists.id })
      .from(therapists)
      .where(eq(therapists.email, email))
      .limit(1);

    if (!therapistResult.length) {
      console.log('No therapist found in database');
      return NextResponse.json({ isPreApproved: false }, { status: 200 });
    }

    console.log('Therapist verified successfully');
    return NextResponse.json({ isPreApproved: true }, { status: 200 });
  } catch (error) {
    console.error('Error checking therapist verification:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
