import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, stripeCustomers } from '@/src/db/schema';
import {
  stripe,
  getOrCreateStripeCustomer,
  getSubscriptionStatus,
  syncStripeDataToKV,
} from '@/src/features/stripe';

// GET - Get subscription status
export async function GET() {
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
      // No Stripe customer yet, return no subscription
      return NextResponse.json({
        status: 'none',
        subscriptionId: null,
        priceId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    }

    const stripeCustomerId = customerRecord[0].stripeCustomerId;

    // Get subscription status (from cache or Stripe API)
    const subscriptionData = await getSubscriptionStatus(stripeCustomerId);

    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error('[SUBSCRIPTION API] Error getting subscription status:', error);
    return NextResponse.json({ error: 'Failed to get subscription status' }, { status: 500 });
  }
}

// POST - Create checkout session for subscription
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { priceId, successUrl, cancelUrl } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail);

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      metadata: {
        userId: userId.toString(),
      },
      // Enable customer portal management
      subscription_data: {
        metadata: {
          userId: userId.toString(),
        },
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('[SUBSCRIPTION API] Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

// PATCH - Manage subscription (cancel, resume, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, subscriptionId } = body;

    if (!action || !subscriptionId) {
      return NextResponse.json(
        { error: 'Action and subscription ID are required' },
        { status: 400 },
      );
    }

    // Get the internal user record
    const userRecord = await db.select().from(users).where(eq(users.clerkId, user.id)).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRecord[0].id;

    // Verify the subscription belongs to this user
    const customerRecord = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, userId))
      .limit(1);

    if (customerRecord.length === 0) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    const stripeCustomerId = customerRecord[0].stripeCustomerId;

    let updatedSubscription;

    switch (action) {
      case 'cancel':
        updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        break;

      case 'resume':
        updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        });
        break;

      case 'cancel_immediately':
        updatedSubscription = await stripe.subscriptions.cancel(subscriptionId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Sync the updated subscription data
    await syncStripeDataToKV(stripeCustomerId);

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
        currentPeriodEnd: updatedSubscription.items.data[0]?.current_period_end || null,
      },
    });
  } catch (error) {
    console.error('[SUBSCRIPTION API] Error managing subscription:', error);
    return NextResponse.json({ error: 'Failed to manage subscription' }, { status: 500 });
  }
}
