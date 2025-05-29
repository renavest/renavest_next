import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { stripe, STRIPE_CONFIG, syncStripeDataToKV } from '@/src/features/stripe';
import {
  handleCheckoutSessionCompleted,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleAccountUpdated,
  handleSetupIntentSucceeded,
  handleSetupIntentFailed,
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
  'account.external_account.created', // For Connect bank account setup
  'account.external_account.updated', // For Connect bank account changes
  'capability.updated', // For Connect capability changes
  'financial_connections.account.created', // For financial connections
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

      case 'account.external_account.created':
      case 'account.external_account.updated': {
        const externalAccount = event.data.object as Stripe.ExternalAccount;
        console.log(`[STRIPE WEBHOOK] External account ${event.type}: ${externalAccount.id}`);
        // The account.updated event will handle the main status updates
        // This is mainly for logging and potential future features
        break;
      }

      case 'capability.updated': {
        const capability = event.data.object as Stripe.Capability;
        console.log(
          `[STRIPE WEBHOOK] Capability updated: ${capability.id} - Status: ${capability.status}`,
        );
        // The account.updated event will handle the main status updates
        // This provides additional granular capability tracking
        break;
      }

      case 'financial_connections.account.created': {
        const financialAccount = event.data.object as Stripe.FinancialConnections.Account;
        console.log(
          `[STRIPE WEBHOOK] Financial connections account created: ${financialAccount.id}`,
        );
        // This is for future financial connections features
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
        await handleSetupIntentSucceeded(setupIntent);
        break;
      }

      case 'setup_intent.setup_failed': {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        await handleSetupIntentFailed(setupIntent);
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
  let body: string;
  let signature: string | null;

  try {
    // Get raw body - crucial for webhook signature verification
    body = await req.text();

    // Get headers
    const headersList = await headers();
    signature = headersList.get('Stripe-Signature');

    if (!signature) {
      console.error('[STRIPE WEBHOOK] No signature header found');
      return NextResponse.json({ error: 'No signature header' }, { status: 400 });
    }

    if (!STRIPE_CONFIG.WEBHOOK_SECRET) {
      console.error('[STRIPE WEBHOOK] No webhook secret configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    console.log('[STRIPE WEBHOOK] Attempting signature verification...');
    console.log('[STRIPE WEBHOOK] Body length:', body.length);
    console.log('[STRIPE WEBHOOK] Signature header present:', !!signature);
    console.log('[STRIPE WEBHOOK] Webhook secret configured:', !!STRIPE_CONFIG.WEBHOOK_SECRET);
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Error reading request:', error);
    return NextResponse.json({ error: 'Failed to read request' }, { status: 400 });
  }

  // In development, allow bypassing signature verification for testing
  // Remove this in production!
  const isDevelopment = process.env.NODE_ENV === 'development';
  let event: Stripe.Event;

  try {
    if (isDevelopment && process.env.STRIPE_WEBHOOK_BYPASS_SIGNATURE === 'true') {
      console.log('[STRIPE WEBHOOK] Development mode: bypassing signature verification');
      event = JSON.parse(body);
    } else {
      // Verify the webhook signature with 2025 security standards
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.WEBHOOK_SECRET,
        STRIPE_CONFIG.SECURITY.WEBHOOK_TOLERANCE, // Use configured tolerance (300 seconds)
      );
    }

    // Log event for debugging (but don't log sensitive data)
    console.log(`[STRIPE WEBHOOK] Successfully verified event: ${event.type} (${event.id})`);

    // Process the event asynchronously for better webhook response times
    await processEvent(event);

    // Return quickly to acknowledge receipt (webhook best practice)
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Error processing webhook:', error);

    if (error instanceof stripe.errors.StripeSignatureVerificationError) {
      console.error('[STRIPE WEBHOOK] Signature verification failed:', error.message);
      console.error(
        '[STRIPE WEBHOOK] Webhook secret length:',
        STRIPE_CONFIG.WEBHOOK_SECRET?.length || 0,
      );
      console.error('[STRIPE WEBHOOK] Signature header:', signature);
      console.error('[STRIPE WEBHOOK] Body preview:', body.substring(0, 200) + '...');

      // In development, provide helpful debugging information
      if (isDevelopment) {
        console.error('[STRIPE WEBHOOK] Development tip: You may need to:');
        console.error(
          '  1. Use Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe',
        );
        console.error('  2. Update STRIPE_WEBHOOK_SECRET with the CLI secret');
        console.error('  3. Or set STRIPE_WEBHOOK_BYPASS_SIGNATURE=true for testing');
      }

      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Return 500 for retry logic
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
