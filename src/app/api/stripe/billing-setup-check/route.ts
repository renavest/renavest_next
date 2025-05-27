import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { db } from '@/src/db';
import { users, stripeCustomers } from '@/src/db/schema';
import { stripe } from '@/src/features/stripe';

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

    // CRITICAL: Check if we have the Stripe customer record in our database
    const stripeCustomerRecord = await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, userId))
      .limit(1);

    // If we don't have the customer record in our DB, the integration is incomplete
    if (stripeCustomerRecord.length === 0) {
      console.log('[BILLING SETUP CHECK] No Stripe customer record found in database for user', {
        userId,
        clerkId: user.id,
      });
      return NextResponse.json({
        hasPaymentMethod: false,
        stripeCustomerId: null,
        paymentMethodsCount: 0,
        integrationComplete: false,
        reason: 'stripe_customer_not_synced',
      });
    }

    const stripeCustomerId = stripeCustomerRecord[0].stripeCustomerId;

    // Verify the customer exists in Stripe and get payment methods
    let customer: Stripe.Customer | Stripe.DeletedCustomer;
    let paymentMethods: Stripe.ApiList<Stripe.PaymentMethod>;

    try {
      [customer, paymentMethods] = await Promise.all([
        stripe.customers.retrieve(stripeCustomerId),
        stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: 'card',
        }),
      ]);

      // Ensure we have a valid customer, not a deleted one
      if (customer.deleted) {
        throw new Error('Customer has been deleted');
      }
    } catch (stripeError) {
      console.error('[BILLING SETUP CHECK] Error fetching Stripe data', {
        stripeCustomerId,
        userId,
        error: stripeError,
      });

      // If Stripe customer doesn't exist or is inaccessible, integration is broken
      return NextResponse.json({
        hasPaymentMethod: false,
        stripeCustomerId,
        paymentMethodsCount: 0,
        integrationComplete: false,
        reason: 'stripe_customer_inaccessible',
      });
    }

    const hasPaymentMethod = paymentMethods.data.length > 0;

    // Billing is only considered "connected" if:
    // 1. We have the customer record in our database
    // 2. The Stripe customer is accessible
    // 3. The customer has at least one payment method
    const integrationComplete = hasPaymentMethod;

    return NextResponse.json({
      hasPaymentMethod,
      stripeCustomerId,
      paymentMethodsCount: paymentMethods.data.length,
      customerEmail: 'email' in customer ? customer.email : null,
      integrationComplete,
      reason: integrationComplete ? 'complete' : 'no_payment_methods',
    });
  } catch (error) {
    console.error('[BILLING SETUP CHECK] Error checking billing setup:', error);
    return NextResponse.json(
      {
        error: 'Failed to check billing setup',
        hasPaymentMethod: false,
        integrationComplete: false,
        reason: 'system_error',
      },
      { status: 500 },
    );
  }
}
