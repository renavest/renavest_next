import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { ALLOWED_EMAILS } from '@/src/constants';
import { db } from '@/src/db';
import { therapists } from '@/src/db/schema';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user's email is in the allowed list
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

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

    return NextResponse.json({ therapistId: therapistResult[0].id });
  } catch (error) {
    console.error('Error fetching therapist ID:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
