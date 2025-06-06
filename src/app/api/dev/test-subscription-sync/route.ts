import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, stripeCustomers } from '@/src/db/schema';
import {
  getOrCreateStripeCustomer,
  syncStripeDataToKV,
  getSubscriptionStatus,
  STRIPE_CONFIG,
} from '@/src/features/stripe';

/**
 * Development-only endpoint to test subscription syncing
 * This helps test the integration without needing webhook setup
 */
export async function POST(_req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

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
    const userEmail = userRecord[0].email;

    console.log(`[DEV TEST] Testing subscription sync for user ${userId} (${userEmail})`);

    // Ensure user has a Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail);
    console.log(`[DEV TEST] Stripe customer ID: ${stripeCustomerId}`);

    // Force sync subscription data from Stripe
    const syncedData = await syncStripeDataToKV(stripeCustomerId);
    console.log(`[DEV TEST] Synced subscription data:`, syncedData);

    // Get the cached subscription status to verify
    const cachedStatus = await getSubscriptionStatus(stripeCustomerId);
    console.log(`[DEV TEST] Cached subscription status:`, cachedStatus);

    return NextResponse.json({
      success: true,
      message: 'Subscription data synced successfully',
      data: {
        userId,
        userEmail,
        stripeCustomerId,
        syncedData,
        cachedStatus,
        starterPriceId: STRIPE_CONFIG.PLANS.STARTER,
      },
    });
  } catch (error) {
    console.error('[DEV TEST] Error testing subscription sync:', error);
    return NextResponse.json(
      {
        error: 'Failed to test subscription sync',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint to check current subscription status
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

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

    // Get the Stripe customer ID
    const customerRecord = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, userId))
      .limit(1);

    if (customerRecord.length === 0) {
      return NextResponse.json({
        message: 'No Stripe customer found',
        hasStripeCustomer: false,
        subscriptionStatus: 'none',
      });
    }

    const stripeCustomerId = customerRecord[0].stripeCustomerId;

    // Get subscription status
    const subscriptionData = await getSubscriptionStatus(stripeCustomerId);

    // Get user database fields
    const updatedUserRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    return NextResponse.json({
      hasStripeCustomer: true,
      stripeCustomerId,
      subscriptionData,
      userDbFields: {
        subscriptionStatus: updatedUserRecord[0]?.subscriptionStatus,
        stripeSubscriptionId: updatedUserRecord[0]?.stripeSubscriptionId,
        subscriptionEndDate: updatedUserRecord[0]?.subscriptionEndDate,
        cancelAtPeriodEnd: updatedUserRecord[0]?.cancelAtPeriodEnd,
      },
      config: {
        starterPriceId: STRIPE_CONFIG.PLANS.STARTER,
        developmentMode: STRIPE_CONFIG.DEVELOPMENT.BYPASS_WEBHOOK_SIGNATURE,
      },
    });
  } catch (error) {
    console.error('[DEV TEST] Error getting subscription status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get subscription status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
