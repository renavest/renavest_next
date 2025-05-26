import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { users, stripeCustomers } from '@/src/db/schema';
import { stripe, getOrCreateStripeCustomer } from '@/src/features/stripe';

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
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(userId, userEmail);

    // Check if customer has any payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    const hasPaymentMethod = paymentMethods.data.length > 0;

    // Get customer details for additional info
    const customer = await stripe.customers.retrieve(stripeCustomerId);

    return NextResponse.json({
      hasPaymentMethod,
      stripeCustomerId,
      paymentMethodsCount: paymentMethods.data.length,
      customerEmail: 'email' in customer ? customer.email : null,
    });
  } catch (error) {
    console.error('[BILLING SETUP CHECK] Error checking billing setup:', error);
    return NextResponse.json({ error: 'Failed to check billing setup' }, { status: 500 });
  }
}
