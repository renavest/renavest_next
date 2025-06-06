import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, stripeCustomers } from '@/src/db/schema';
import { kv, CACHE_KEYS } from '@/src/features/stripe/services/kv-cache';
import { stripe } from '@/src/features/stripe';

/**
 * Development-only endpoint to reset Stripe integration for testing
 * This clears all Stripe-related data for the current user
 */
export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { confirmReset } = body;

    if (!confirmReset) {
      return NextResponse.json(
        {
          error: 'Must confirm reset by sending confirmReset: true',
        },
        { status: 400 },
      );
    }

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
    const resetResults = {
      userId,
      steps: [],
      errors: [],
    };

    console.log(`[DEV RESET] Starting Stripe reset for user ${userId}`);

    try {
      // Step 1: Get Stripe customer record
      const customerRecord = await db
        .select()
        .from(stripeCustomers)
        .where(eq(stripeCustomers.userId, userId))
        .limit(1);

      if (customerRecord.length > 0) {
        const stripeCustomerId = customerRecord[0].stripeCustomerId;

        try {
          // Step 2: Cancel all active subscriptions in Stripe
          const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'active',
          });

          for (const subscription of subscriptions.data) {
            await stripe.subscriptions.cancel(subscription.id);
            resetResults.steps.push(`Cancelled subscription: ${subscription.id}`);
          }

          // Step 3: Clear KV cache for this customer
          await kv.del(CACHE_KEYS.userSubscription(stripeCustomerId));
          resetResults.steps.push(`Cleared KV cache for customer: ${stripeCustomerId}`);

          // Step 4: Remove Stripe customer record from database
          await db.delete(stripeCustomers).where(eq(stripeCustomers.userId, userId));
          resetResults.steps.push(`Removed Stripe customer record: ${stripeCustomerId}`);
        } catch (error) {
          console.error('[DEV RESET] Error handling Stripe customer:', error);
          resetResults.errors.push(`Stripe customer error: ${error.message}`);
        }
      } else {
        resetResults.steps.push('No Stripe customer found');
      }

      // Step 5: Reset user subscription fields in database
      await db
        .update(users)
        .set({
          subscriptionStatus: null,
          stripeSubscriptionId: null,
          subscriptionEndDate: null,
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      resetResults.steps.push('Reset user subscription fields in database');
    } catch (error) {
      console.error('[DEV RESET] Error during reset:', error);
      resetResults.errors.push(error.message);
    }

    console.log(`[DEV RESET] Completed reset for user ${userId}:`, resetResults);

    return NextResponse.json({
      success: true,
      message: 'Stripe integration reset completed',
      results: resetResults,
      nextSteps: [
        'You can now test the subscription flow from the beginning',
        'Visit /employee/billing to start a new subscription',
        'The user will be treated as having no Stripe history',
      ],
    });
  } catch (error) {
    console.error('[DEV RESET] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset Stripe integration',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint to check what would be reset
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

    // Get Stripe customer record
    const customerRecord = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, userId))
      .limit(1);

    let stripeInfo = null;
    if (customerRecord.length > 0) {
      const stripeCustomerId = customerRecord[0].stripeCustomerId;

      try {
        // Get subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          limit: 10,
        });

        stripeInfo = {
          customerId: stripeCustomerId,
          subscriptionCount: subscriptions.data.length,
          subscriptions: subscriptions.data.map((sub) => ({
            id: sub.id,
            status: sub.status,
            priceId: sub.items.data[0]?.price.id,
            created: new Date(sub.created * 1000).toISOString(),
          })),
        };
      } catch (error) {
        stripeInfo = {
          customerId: stripeCustomerId,
          error: `Failed to fetch from Stripe: ${error.message}`,
        };
      }
    }

    return NextResponse.json({
      userId,
      userDbFields: {
        subscriptionStatus: userRecord[0].subscriptionStatus,
        stripeSubscriptionId: userRecord[0].stripeSubscriptionId,
        subscriptionEndDate: userRecord[0].subscriptionEndDate,
        cancelAtPeriodEnd: userRecord[0].cancelAtPeriodEnd,
      },
      hasStripeCustomer: customerRecord.length > 0,
      stripeInfo,
      resetInstructions: {
        endpoint: '/api/dev/reset-stripe',
        method: 'POST',
        body: { confirmReset: true },
        warning: 'This will permanently delete all Stripe data for this user',
      },
    });
  } catch (error) {
    console.error('[DEV RESET] Error checking reset status:', error);
    return NextResponse.json(
      {
        error: 'Failed to check reset status',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
