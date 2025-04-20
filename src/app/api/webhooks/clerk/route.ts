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
  object: 'event';
}

// Webhook processing error types
type WebhookError =
  | { type: 'MissingSecret' }
  | { type: 'MissingHeaders' }
  | { type: 'InvalidSignature'; error: unknown }
  | { type: 'ProcessingError'; error: unknown };

/**
 * Verify webhook signature and parse event
 */
async function verifyWebhook(
  req: NextRequest,
  webhookSecret: string,
  svixHeaders: { id: string; timestamp: string; signature: string },
): Promise<Result<WebhookEvent, WebhookError>> {
  try {
    const payload = await req.clone().json();
    const body = JSON.stringify(payload);

    const webhook = new Webhook(webhookSecret);
    const event = webhook.verify(body, {
      'svix-id': svixHeaders.id,
      'svix-timestamp': svixHeaders.timestamp,
      'svix-signature': svixHeaders.signature,
    }) as WebhookEvent;

    return ok(event);
  } catch (error) {
    return err({ type: 'InvalidSignature', error });
  }
}

/**
 * Process webhook event with appropriate handler
 */
async function processEvent(
  event: WebhookEvent,
  environment: string,
): Promise<Result<boolean, WebhookError>> {
  try {
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
      if (result.isErr()) {
        logger.error('Event handler error', {
          type: event.type,
          error: result.error,
          userId: event.data.id,
          environment,
        });
        return err({ type: 'ProcessingError', error: result.error });
      }
      return ok(true);
    }

    logger.warn('Unhandled event type', {
      type: event.type,
      userId: event.data.id,
      environment,
    });
    return ok(true);
  } catch (error) {
    logger.error('Event processing error', {
      error,
      environment,
    });
    return err({
      type: 'ProcessingError',
      error,
    });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const environment = process.env.NODE_ENV || 'development';

  // Validate webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('Missing Clerk webhook secret');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // Validate headers
  const headersList = await headers();
  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.error('Missing required Svix headers', {
      svixId: !!svixId,
      svixTimestamp: !!svixTimestamp,
      svixSignature: !!svixSignature,
    });
    return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
  }

  // Verify webhook signature
  const verificationResult = await verifyWebhook(req, webhookSecret, {
    id: svixId,
    timestamp: svixTimestamp,
    signature: svixSignature,
  });

  if (verificationResult.isErr()) {
    logger.error('Webhook verification failed', {
      error: verificationResult.error,
      environment,
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Process event
  const event = verificationResult.value;
  logger.info('Processing webhook event', {
    type: event.type,
    environment,
    userId: event.data.id,
  });

  const result = await processEvent(event, environment);

  return result.match(
    () => {
      const duration = Date.now() - startTime;
      logger.info('Webhook processed successfully', {
        duration: `${duration}ms`,
        environment,
      });
      return NextResponse.json({ success: true });
    },
    (error) => {
      const duration = Date.now() - startTime;
      logger.error('Webhook processing failed', {
        duration: `${duration}ms`,
        error,
        environment,
      });

      // Always return 200 to prevent Clerk from retrying
      return NextResponse.json(
        { success: false, error: 'Webhook processed with errors' },
        { status: 200 },
      );
    },
  );
}
