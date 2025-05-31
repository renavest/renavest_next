import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

import { db } from '@/src/db';
import { therapists, sessionPayments, bookingSessions, therapistPayouts } from '@/src/db/schema';

import { syncStripeDataToKV } from './stripe-operations';

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;

  // If this was a subscription checkout, sync the customer data
  if (session.mode === 'subscription') {
    await syncStripeDataToKV(customerId);
  }

  // If this was a session payment, update the session payment record
  if (session.metadata?.bookingSessionId) {
    const bookingSessionId = parseInt(session.metadata.bookingSessionId);

    await db
      .update(sessionPayments)
      .set({
        status: 'succeeded',
        stripePaymentIntentId: session.payment_intent as string,
        updatedAt: new Date(),
      })
      .where(eq(sessionPayments.bookingSessionId, bookingSessionId));
  }
}

export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;

  if (!metadata.bookingSessionId || !metadata.userId || !metadata.therapistId) {
    console.warn('[STRIPE WEBHOOK] PaymentIntent missing required metadata');
    return;
  }

  const bookingSessionId = parseInt(metadata.bookingSessionId);
  const therapistId = parseInt(metadata.therapistId);

  // Update session payment record
  await db
    .update(sessionPayments)
    .set({
      status: 'succeeded',
      chargedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(sessionPayments.stripePaymentIntentId, paymentIntent.id));

  // Update booking session status
  await db
    .update(bookingSessions)
    .set({
      status: 'completed',
      updatedAt: new Date(),
    })
    .where(eq(bookingSessions.id, bookingSessionId));

  // Record therapist payout (90% of the amount after fees)
  const therapistAmount = Math.floor(paymentIntent.amount * 0.9); // 90% to therapist

  await db.insert(therapistPayouts).values({
    therapistId,
    bookingSessionId,
    amountCents: therapistAmount,
    stripeTransferId: paymentIntent.transfer_data?.destination as string,
    payoutType: 'session_fee',
    status: 'pending', // Will be updated when the actual transfer completes
  });
}

export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const status = paymentIntent.status === 'canceled' ? 'canceled' : 'failed';

  await db
    .update(sessionPayments)
    .set({
      status: status,
      updatedAt: new Date(),
    })
    .where(eq(sessionPayments.stripePaymentIntentId, paymentIntent.id));
}

export async function handleAccountUpdated(account: Stripe.Account) {
  // Update therapist's Stripe Connect account status
  await db
    .update(therapists)
    .set({
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      detailsSubmitted: account.details_submitted || false,
      onboardingStatus: account.details_submitted ? 'completed' : 'pending',
      updatedAt: new Date(),
    })
    .where(eq(therapists.stripeAccountId, account.id));
}

export async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  console.log(`[STRIPE WEBHOOK] Setup intent succeeded: ${setupIntent.id}`);

  // Sync customer data to ensure payment method cache is updated
  if (setupIntent.customer && typeof setupIntent.customer === 'string') {
    await syncStripeDataToKV(setupIntent.customer);
  }

  // Note: The payment method is automatically attached to the customer
  // when the setup intent succeeds, so we don't need to do additional work here
}

export async function handleSetupIntentFailed(setupIntent: Stripe.SetupIntent) {
  console.log(`[STRIPE WEBHOOK] Setup intent failed: ${setupIntent.id}`);

  // Log setup intent failure details for debugging
  if (setupIntent.last_setup_error) {
    console.error(`[STRIPE WEBHOOK] Setup intent failed with error:`, {
      setupIntentId: setupIntent.id,
      customerId: setupIntent.customer,
      errorType: setupIntent.last_setup_error.type,
      errorMessage: setupIntent.last_setup_error.message,
    });
  }
}

