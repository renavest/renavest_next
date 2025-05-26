import { eq } from 'drizzle-orm';

import { db } from '@/src/db';
import { stripeCustomers, users } from '@/src/db/schema';

import { kv, CACHE_KEYS } from '../services/kv-cache';
import { stripe } from '../services/stripe-client';
import type { StripeSubCache } from '../types';

/**
 * Ensures every internal userId has a corresponding stripeCustomerId
 * This is the core function that links Renavest users to Stripe customers
 */
export async function getOrCreateStripeCustomer(
  userId: number,
  userEmail: string,
): Promise<string> {
  // First, check if we already have a Stripe customer for this user
  const existingCustomer = await db
    .select()
    .from(stripeCustomers)
    .where(eq(stripeCustomers.userId, userId))
    .limit(1);

  if (existingCustomer.length > 0) {
    return existingCustomer[0].stripeCustomerId;
  }

  // Create a new Stripe customer
  const newCustomer = await stripe.customers.create({
    email: userEmail,
    metadata: {
      userId: userId.toString(), // Store the internal user ID in Stripe metadata
    },
  });

  // Store the relation between userId and stripeCustomerId in the database
  await db.insert(stripeCustomers).values({
    userId,
    stripeCustomerId: newCustomer.id,
  });

  return newCustomer.id;
}

/**
 * The core function that syncs all Stripe data for a customer to KV
 * This is called from webhooks and success endpoints to maintain consistency
 */
export async function syncStripeDataToKV(customerId: string): Promise<StripeSubCache> {
  try {
    // Fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      const subData: StripeSubCache = {
        subscriptionId: null,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        planId: null,
        customerId: customerId,
      };
      await kv.set(CACHE_KEYS.userSubscription(customerId), subData);
      return subData;
    }

    // If a user can have multiple subscriptions, that's handled separately
    const subscription = subscriptions.data[0];

    // Store complete subscription state
    const subData: StripeSubCache = {
      subscriptionId: subscription.id,
      status: subscription.status,
      planId: subscription.items.data[0]?.price.id || null,
      currentPeriodEnd: subscription.items.data[0]?.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      customerId: customerId,
    };

    // Store the data in KV
    await kv.set(CACHE_KEYS.userSubscription(customerId), subData);

    // Also update the database with the subscription status
    await updateUserSubscriptionInDB(customerId, subData);

    return subData;
  } catch (error) {
    console.error('[STRIPE SYNC] Error syncing customer data:', error);
    throw error;
  }
}

/**
 * Updates the user's subscription status in the database
 */
async function updateUserSubscriptionInDB(
  stripeCustomerId: string,
  subData: StripeSubCache,
): Promise<void> {
  try {
    // Find the user associated with this Stripe customer
    const customerRecord = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.stripeCustomerId, stripeCustomerId))
      .limit(1);

    if (customerRecord.length === 0) {
      console.warn(`[STRIPE SYNC] No user found for Stripe customer ${stripeCustomerId}`);
      return;
    }

    const userId = customerRecord[0].userId;

    // Update user's subscription fields
    if (!subData.status || !subData.subscriptionId) {
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
    } else {
      await db
        .update(users)
        .set({
          subscriptionStatus: subData.status,
          stripeSubscriptionId: subData.subscriptionId,
          subscriptionEndDate: subData.currentPeriodEnd
            ? new Date(subData.currentPeriodEnd * 1000)
            : null,
          cancelAtPeriodEnd: subData.cancelAtPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  } catch (error) {
    console.error('[STRIPE SYNC] Error updating user subscription in DB:', error);
    throw error;
  }
}

/**
 * Get cached subscription data from KV with fallback to Stripe API
 */
export async function getSubscriptionStatus(stripeCustomerId: string): Promise<StripeSubCache> {
  try {
    // First try to get from cache
    const cached = await kv.get<StripeSubCache>(CACHE_KEYS.userSubscription(stripeCustomerId));

    if (cached) {
      return cached;
    }

    // If not cached, sync from Stripe and return
    return await syncStripeDataToKV(stripeCustomerId);
  } catch (error) {
    console.error('[STRIPE] Error getting subscription status:', error);
    // Return a safe default
    return {
      subscriptionId: null,
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      planId: null,
      customerId: stripeCustomerId,
    };
  }
}
