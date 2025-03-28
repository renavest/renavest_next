/**
 * Enhanced webhook endpoint for Clerk authentication events
 *
 * To enable webhooks during local development:
 * 1. Run: lt --port 3000 --subdomain tall-sloths
 * 2. Add webhook URL in Clerk Dashboard: https://tall-sloths.loca.lt/api/webhooks/clerk
 * 3. Make sure to verify webhook secret key is what's in .env.local
 */
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

import {
  WebhookUserData,
  handleUserActivity,
  handleUserCreateOrUpdate,
  handleUserDeletion,
} from './handlers';

// User-related Clerk webhook event types
type WebhookEventType =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.signed_in'
  | 'user.signed_out'
  | 'session.created'
  | 'session.removed'
  | 'session.ended';

// Generic webhook event
interface WebhookEvent {
  type: WebhookEventType;
  data: WebhookUserData;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Get the webhook secret from env vars
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Missing CLERK_WEBHOOK_SECRET env variable');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // Get the headers
    const headersList = await headers();
    const svixId = headersList.get('svix-id');
    const svixTimestamp = headersList.get('svix-timestamp');
    const svixSignature = headersList.get('svix-signature');

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing required Svix headers');
      return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const webhook = new Webhook(webhookSecret);

    let event: WebhookEvent;

    try {
      // Verify the payload with the headers
      event = webhook.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // Log received event for debugging
    console.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await handleUserCreateOrUpdate(event.type, event.data);
        break;

      case 'user.deleted':
        await handleUserDeletion(event.data);
        break;

      case 'user.signed_in':
      case 'user.signed_out':
        await handleUserActivity(event.data);
        break;

      case 'session.created':
      case 'session.removed':
      case 'session.ended':
        // These events are informational only, no action needed
        console.log(`Session event received: ${event.type}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    const duration = Date.now() - startTime;
    console.log(`Webhook processed in ${duration}ms`);

    return NextResponse.json({ success: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Webhook error after ${duration}ms:`, error);

    // Always return 200 to prevent Clerk from retrying
    // Unless it's a verification error (which was handled above)
    return NextResponse.json(
      { success: false, error: 'Webhook processed with errors' },
      { status: 200 },
    );
  }
}
