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

// Events we track for updates
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

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[STRIPE WEBHOOK] Error processing ${event.type}:`, error);
    throw error;
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
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.WEBHOOK_SECRET);

    // Process the event
    await processEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Error processing webhook:', error);

    if (error instanceof stripe.errors.StripeSignatureVerificationError) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
