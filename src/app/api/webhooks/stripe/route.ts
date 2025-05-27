import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { stripe, STRIPE_CONFIG, syncStripeDataToKV } from '@/src/features/stripe';
import {
  handleCheckoutSessionCompleted,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleAccountUpdated,
} from '@/src/features/stripe/utils/webhook-handlers';

// Events we track for updates - optimized for 2025 standards
const ALLOWED_STRIPE_WEBHOOK_EVENTS: Stripe.Event.Type[] = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'customer.subscription.pending_update_applied',
  'customer.subscription.pending_update_expired',
  'customer.subscription.trial_will_end',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.payment_action_required',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
  'account.updated', // For Connect accounts onboarding status
  // Added for better payment method handling
  'payment_method.automatically_updated', // Replaces card_automatically_updated as of 2020-08-27
  'setup_intent.succeeded',
  'setup_intent.setup_failed',
];

async function processEvent(event: Stripe.Event) {
  // Skip processing if the event isn't one we're tracking
  if (!ALLOWED_STRIPE_WEBHOOK_EVENTS.includes(event.type)) {
    console.log(`[STRIPE WEBHOOK] Ignoring event type: ${event.type}`);
    return;
  }

  console.log(`[STRIPE WEBHOOK] Processing event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
      case 'customer.subscription.pending_update_applied':
      case 'customer.subscription.pending_update_expired':
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        if (typeof subscription.customer === 'string') {
          await syncStripeDataToKV(subscription.customer);
        }
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed':
      case 'invoice.payment_action_required': {
        const invoice = event.data.object as Stripe.Invoice;
        if (typeof invoice.customer === 'string') {
          await syncStripeDataToKV(invoice.customer);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      case 'payment_method.automatically_updated': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        console.log(`[STRIPE WEBHOOK] Payment method automatically updated: ${paymentMethod.id}`);
        // Handle payment method updates if needed
        break;
      }

      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        console.log(`[STRIPE WEBHOOK] Setup intent succeeded: ${setupIntent.id}`);
        // Handle successful setup intents if needed
        break;
      }

      case 'setup_intent.setup_failed': {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        console.log(`[STRIPE WEBHOOK] Setup intent failed: ${setupIntent.id}`);
        // Handle failed setup intents if needed
        break;
      }

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[STRIPE WEBHOOK] Error processing ${event.type}:`, error);
    throw error; // Re-throw to ensure webhook returns 500 for retry
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('Stripe-Signature');

  if (!signature) {
    console.error('[STRIPE WEBHOOK] No signature header found');
    return NextResponse.json({ error: 'No signature header' }, { status: 400 });
  }

  if (!STRIPE_CONFIG.WEBHOOK_SECRET) {
    console.error('[STRIPE WEBHOOK] No webhook secret configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    // Verify the webhook signature with 2025 security standards
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.WEBHOOK_SECRET,
      STRIPE_CONFIG.SECURITY.WEBHOOK_TOLERANCE, // Use configured tolerance (300 seconds)
    );

    // Log event for debugging (but don't log sensitive data)
    console.log(`[STRIPE WEBHOOK] Received event: ${event.type} (${event.id})`);

    // Process the event asynchronously for better webhook response times
    await processEvent(event);

    // Return quickly to acknowledge receipt (webhook best practice)
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Error processing webhook:', error);

    if (error instanceof stripe.errors.StripeSignatureVerificationError) {
      console.error('[STRIPE WEBHOOK] Signature verification failed:', error.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Return 500 for retry logic
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
