import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, therapists } from '@/src/db/schema';

// POST - Disconnect Stripe Connect account
export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;
    const userRole = userRecord[0].role;

    // Only therapists can disconnect Connect accounts
    if (userRole !== 'therapist') {
      return NextResponse.json(
        { error: 'Only therapists can disconnect Connect accounts' },
        { status: 403 },
      );
    }

    // Get therapist record
    const therapistRecord = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userId))
      .limit(1);

    if (therapistRecord.length === 0) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const therapist = therapistRecord[0];

    if (!therapist.stripeAccountId) {
      return NextResponse.json({ error: 'No Stripe account to disconnect' }, { status: 400 });
    }

    // Note: We don't delete the Stripe account itself (that would require special permissions)
    // Instead, we remove the association in our database
    // The therapist can still access their Stripe Express dashboard directly if needed
    await db
      .update(therapists)
      .set({
        stripeAccountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        onboardingStatus: 'not_started',
        updatedAt: new Date(),
      })
      .where(eq(therapists.id, therapist.id));

    console.log(`[CONNECT DISCONNECT] Disconnected Stripe account for therapist ${therapist.id}`);

    return NextResponse.json({
      success: true,
      message: 'Bank account disconnected successfully',
    });
  } catch (error) {
    console.error('[CONNECT DISCONNECT] Error disconnecting Connect account:', error);
    return NextResponse.json({ error: 'Failed to disconnect Connect account' }, { status: 500 });
  }
}
