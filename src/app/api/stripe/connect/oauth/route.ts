import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, therapists } from '@/src/db/schema';
import { stripe } from '@/src/features/stripe';

// GET - Initiate Stripe Connect OAuth flow
export async function GET(_req: NextRequest) {
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

    // Only therapists can initiate Connect onboarding
    if (userRole !== 'therapist') {
      return NextResponse.json(
        { error: 'Only therapists can use Stripe Connect' },
        { status: 403 },
      );
    }

    // Check if therapist record exists
    const therapistRecord = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userId))
      .limit(1);

    if (therapistRecord.length === 0) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const therapist = therapistRecord[0];

    // If already connected, return status
    if (therapist.stripeAccountId) {
      return NextResponse.json({
        connected: true,
        accountId: therapist.stripeAccountId,
        onboardingStatus: therapist.onboardingStatus,
      });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const businessProfile = {
      name: therapist.name,
      support_email: userEmail,
      url: process.env.NEXT_PUBLIC_APP_URL,
    };

    // Create Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // You might want to make this configurable
      email: userEmail,
      business_profile: businessProfile,
      metadata: {
        userId: userId.toString(),
        therapistId: therapist.id.toString(),
      },
    });

    // Update therapist record with account ID
    await db
      .update(therapists)
      .set({
        stripeAccountId: account.id,
        onboardingStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(therapists.id, therapist.id));

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/therapist/connect/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/therapist/connect/return`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id,
    });
  } catch (error) {
    console.error('[CONNECT OAUTH] Error initiating Connect flow:', error);
    return NextResponse.json({ error: 'Failed to initiate Connect flow' }, { status: 500 });
  }
}
