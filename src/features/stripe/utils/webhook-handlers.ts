import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

import { db } from '@/src/db';
import { therapists, sessionPayments, bookingSessions, therapistPayouts } from '@/src/db/schema';

import { syncStripeDataToKV } from './stripe-operations';

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;

  // If this was a subscription checkout, sync the customer data
  if (session.mode === 'subscription') {
    console.log(`[STRIPE WEBHOOK] Subscription checkout completed for customer: ${customerId}`);

    try {
      // Sync subscription data to KV cache and database
      await syncStripeDataToKV(customerId);

      // Log successful subscription activation
      console.log(
        `[STRIPE WEBHOOK] Successfully synced subscription data for customer: ${customerId}`,
      );
    } catch (error) {
      console.error(
        `[STRIPE WEBHOOK] Failed to sync subscription data for customer ${customerId}:`,
        error,
      );
      throw error; // Re-throw to ensure webhook returns 500 for retry
    }
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

  // CRITICAL: Idempotency check - prevent duplicate processing
  const existingPayment = await db
    .select()
    .from(sessionPayments)
    .where(eq(sessionPayments.stripePaymentIntentId, paymentIntent.id))
    .limit(1);
    
  if (existingPayment.length > 0 && existingPayment[0].status === 'succeeded') {
    console.log(`[STRIPE WEBHOOK] Payment already processed: ${paymentIntent.id}`);
    return; // Idempotent - already processed
  }

  if (!metadata.bookingSessionId || !metadata.userId || !metadata.therapistId) {
    console.warn('[STRIPE WEBHOOK] PaymentIntent missing required metadata', {
      paymentIntentId: paymentIntent.id,
      metadata: metadata,
    });
    return;
  }

  // Validate metadata types
  const bookingSessionId = parseInt(metadata.bookingSessionId);
  const therapistId = parseInt(metadata.therapistId);
  
  if (isNaN(bookingSessionId) || isNaN(therapistId)) {
    console.warn('[STRIPE WEBHOOK] PaymentIntent metadata has invalid types', {
      paymentIntentId: paymentIntent.id,
      bookingSessionId: metadata.bookingSessionId,
      therapistId: metadata.therapistId,
    });
    return;
  }

  // CRITICAL: Wrap all payment updates in a transaction for atomicity
  await db.transaction(async (tx) => {
    // Update session payment record
    await tx
      .update(sessionPayments)
      .set({
        status: 'succeeded',
        chargedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sessionPayments.stripePaymentIntentId, paymentIntent.id));

    // Update booking session status
    await tx
      .update(bookingSessions)
      .set({
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(bookingSessions.id, bookingSessionId));

    // Record therapist payout (90% of the amount after fees)
    const therapistAmount = Math.floor(paymentIntent.amount * 0.9); // 90% to therapist

    await tx.insert(therapistPayouts).values({
      therapistId,
      bookingSessionId,
      amountCents: therapistAmount,
      stripeTransferId: paymentIntent.transfer_data?.destination as string,
      payoutType: 'session_fee',
      status: 'pending', // Will be updated when the actual transfer completes
    });
  }); // End transaction

  console.log('[STRIPE WEBHOOK] Payment processed successfully', {
    paymentIntentId: paymentIntent.id,
    bookingSessionId,
    therapistAmount,
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

/**
 * Handle subscription lifecycle events
 * Ensures subscription status is properly synced across all systems
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  console.log(`[STRIPE WEBHOOK] Subscription ${subscription.status} for customer: ${customerId}`, {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price.id,
  });

  try {
    // Sync the updated subscription data
    await syncStripeDataToKV(customerId);
    console.log(
      `[STRIPE WEBHOOK] Successfully synced subscription update for customer: ${customerId}`,
    );
  } catch (error) {
    console.error(
      `[STRIPE WEBHOOK] Failed to sync subscription update for customer ${customerId}:`,
      error,
    );
    throw error; // Re-throw to ensure webhook returns 500 for retry
  }
}

/**
 * Handle invoice payment events
 * Important for monitoring subscription health and payment issues
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.log(`[STRIPE WEBHOOK] Invoice payment succeeded for customer: ${customerId}`, {
    invoiceId: invoice.id,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
  });

  // Sync subscription data to ensure status is current
  if (customerId) {
    try {
      await syncStripeDataToKV(customerId);
    } catch (error) {
      console.error(
        `[STRIPE WEBHOOK] Failed to sync after invoice payment for customer ${customerId}:`,
        error,
      );
    }
  }
}

/**
 * Handle failed invoice payments
 * Critical for subscription management and customer communication
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.error(`[STRIPE WEBHOOK] Invoice payment failed for customer: ${customerId}`, {
    invoiceId: invoice.id,
    attemptCount: invoice.attempt_count,
  });

  // Sync subscription data to reflect payment failure status
  if (customerId) {
    try {
      await syncStripeDataToKV(customerId);
    } catch (error) {
      console.error(
        `[STRIPE WEBHOOK] Failed to sync after invoice payment failure for customer ${customerId}:`,
        error,
      );
    }
  }
}
