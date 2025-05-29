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

    // Construct proper URLs with fallback and validation
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const refreshUrl = `${baseUrl}/therapist/connect/refresh`;
    const returnUrl = `${baseUrl}/therapist/connect/return`;

    // Validate URLs start with http/https
    if (!refreshUrl.startsWith('http://') && !refreshUrl.startsWith('https://')) {
      console.error('[CONNECT OAUTH] Invalid refresh URL:', refreshUrl);
      return NextResponse.json({ error: 'Invalid app URL configuration' }, { status: 500 });
    }

    if (!returnUrl.startsWith('http://') && !returnUrl.startsWith('https://')) {
      console.error('[CONNECT OAUTH] Invalid return URL:', returnUrl);
      return NextResponse.json({ error: 'Invalid app URL configuration' }, { status: 500 });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
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
