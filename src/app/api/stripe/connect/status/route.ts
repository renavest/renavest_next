import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, therapists } from '@/src/db/schema';
import { stripe } from '@/src/features/stripe';

// GET - Get Connect account status
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

    // Only therapists can check Connect status
    if (userRole !== 'therapist') {
      return NextResponse.json(
        { error: 'Only therapists can check Connect status' },
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

    // If no Stripe account ID, not connected
    if (!therapist.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboardingStatus: 'not_started',
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    // Fetch real-time status from Stripe
    const account = await stripe.accounts.retrieve(therapist.stripeAccountId);

    // Update local database with current status
    await db
      .update(therapists)
      .set({
        chargesEnabled: account.charges_enabled || false,
        payoutsEnabled: account.payouts_enabled || false,
        detailsSubmitted: account.details_submitted || false,
        onboardingStatus: account.details_submitted ? 'completed' : 'pending',
        updatedAt: new Date(),
      })
      .where(eq(therapists.id, therapist.id));

    return NextResponse.json({
      connected: true,
      accountId: account.id,
      onboardingStatus: account.details_submitted ? 'completed' : 'pending',
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      detailsSubmitted: account.details_submitted || false,
      requiresAction:
        account.requirements?.currently_due && account.requirements.currently_due.length > 0,
      requirements: account.requirements?.currently_due || [],
    });
  } catch (error) {
    console.error('[CONNECT STATUS] Error fetching Connect status:', error);
    return NextResponse.json({ error: 'Failed to fetch Connect status' }, { status: 500 });
  }
}

// POST - Refresh onboarding link
export async function POST(_req: NextRequest) {
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

    // Only therapists can refresh onboarding
    if (userRole !== 'therapist') {
      return NextResponse.json(
        { error: 'Only therapists can refresh onboarding' },
        { status: 403 },
      );
    }

    // Get therapist record
    const therapistRecord = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, userId))
      .limit(1);

    if (therapistRecord.length === 0 || !therapistRecord[0].stripeAccountId) {
      return NextResponse.json({ error: 'No Stripe Connect account found' }, { status: 404 });
    }

    const stripeAccountId = therapistRecord[0].stripeAccountId;

    // Construct proper URLs with fallback and validation
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const refreshUrl = `${baseUrl}/therapist/connect/refresh`;
    const returnUrl = `${baseUrl}/therapist/connect/return`;

    // Validate URLs start with http/https
    if (!refreshUrl.startsWith('http://') && !refreshUrl.startsWith('https://')) {
      console.error('[CONNECT STATUS] Invalid refresh URL:', refreshUrl);
      return NextResponse.json({ error: 'Invalid app URL configuration' }, { status: 500 });
    }

    if (!returnUrl.startsWith('http://') && !returnUrl.startsWith('https://')) {
      console.error('[CONNECT STATUS] Invalid return URL:', returnUrl);
      return NextResponse.json({ error: 'Invalid app URL configuration' }, { status: 500 });
    }

    // Create new account link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error('[CONNECT STATUS] Error refreshing onboarding link:', error);
    return NextResponse.json({ error: 'Failed to refresh onboarding link' }, { status: 500 });
  }
}
