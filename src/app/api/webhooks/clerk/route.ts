/**
 * Enhanced webhook endpoint for Clerk authentication events
 *
 * To enable webhooks during local development:
 * 1. Run: lt --port 3000 --subdomain tall-sloths
 * 2. Add webhook URL in Clerk Dashboard: https://tall-sloths.loca.lt/api/webhooks/clerk
 * 3. Make sure to verify webhook secret key is what's in .env.local
 */
import { Result, ok, err } from 'neverthrow';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

import logger from '@/src/lib/logger';

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

// Webhook processing error types
type WebhookError =
  | { type: 'MissingSecret' }
  | { type: 'MissingHeaders' }
  | { type: 'InvalidSignature'; error: unknown }
  | { type: 'ProcessingError'; error: unknown };

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  // Validate webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // Validate headers
  const headersList = await headers();
  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
  }

  // Process webhook
  const processWebhook = async (): Promise<Result<boolean, WebhookError>> => {
    try {
      const payload = await req.json();
      const body = JSON.stringify(payload);

      const webhook = new Webhook(webhookSecret);

      // Verify webhook signature
      const event = webhook.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;

      logger.info('Processing webhook event', { type: event.type });

      // Handle different event types with a more DRY approach
      const eventHandlers: Record<
        WebhookEventType,
        (data: WebhookUserData) => Promise<Result<boolean, unknown>>
      > = {
        'user.created': (data) => handleUserCreateOrUpdate('user.created', data),
        'user.updated': (data) => handleUserCreateOrUpdate('user.updated', data),
        'user.deleted': handleUserDeletion,
        'user.signed_in': handleUserActivity,
        'user.signed_out': handleUserActivity,
        'session.created': async () => ok(true),
        'session.removed': async () => ok(true),
        'session.ended': async () => ok(true),
      };

      const handler = eventHandlers[event.type];
      if (handler) {
        const result = await handler(event.data);
        return result.isOk() ? ok(true) : err({ type: 'ProcessingError', error: result.error });
      }

      logger.warn('Unhandled event type', { type: event.type });
      return ok(true);
    } catch (error) {
      return err({
        type: 'ProcessingError',
        error,
      });
    }
  };

  // Execute webhook processing
  const result = await processWebhook();

  return result.match(
    () => {
      const duration = Date.now() - startTime;
      logger.info('Webhook processed', { duration: `${duration}ms` });
      return NextResponse.json({ success: true });
    },
    (error) => {
      const duration = Date.now() - startTime;
      logger.error('Webhook processing error', {
        duration: `${duration}ms`,
        error,
      });

      // Always return 200 to prevent Clerk from retrying
      return NextResponse.json(
        { success: false, error: 'Webhook processed with errors' },
        { status: 200 },
      );
    },
  );
}
