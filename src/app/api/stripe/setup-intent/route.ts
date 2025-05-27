import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { stripe, getOrCreateStripeCustomer } from '@/src/features/stripe';

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
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // CRITICAL: Ensure database consistency by checking if we have the Stripe customer record
    // If webhooks failed or there's a sync issue, we need to create/fix it
    const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail);

    // Verify the customer is accessible in Stripe before creating setup intent
    try {
      const customer = await stripe.customers.retrieve(stripeCustomerId);
      if (customer.deleted) {
        throw new Error('Stripe customer has been deleted');
      }
    } catch (stripeError) {
      console.error('[SETUP INTENT API] Stripe customer verification failed', {
        stripeCustomerId,
        userId,
        error: stripeError,
      });
      return NextResponse.json(
        {
          error: 'Stripe integration issue - please contact support',
        },
        { status: 500 },
      );
    }

    // Create SetupIntent for future payments
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session', // For future payments
      metadata: {
        userId: userId.toString(),
        userEmail,
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    });
  } catch (error) {
    console.error('[SETUP INTENT API] Error creating setup intent:', error);
    return NextResponse.json({ error: 'Failed to create setup intent' }, { status: 500 });
  }
}
