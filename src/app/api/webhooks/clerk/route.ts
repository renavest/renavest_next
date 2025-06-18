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

import {
  handleUserActivity,
  handleUserCreateOrUpdate,
  handleUserDeletion,
  handleSessionCreated,
  handleSessionEnded,
} from './handlers';
import type { WebhookUserData, WebhookSessionData, WebhookEvent, WebhookError } from './types';

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
    console.log('Processing webhook event', {
      type: event.type,
      dataKeys: Object.keys(event.data),
      environment,
    });

    // Handle session events with their specific data structure
    if (event.type === 'session.created') {
      const sessionData = event.data as WebhookSessionData;
      const result = await handleSessionCreated(sessionData);
      if (result.isErr()) {
        console.error('Session created handler error', {
          type: event.type,
          error: result.error,
          sessionId: sessionData.id,
          environment,
        });
        return err({ type: 'ProcessingError', error: result.error });
      }
      return ok(true);
    }

    if (event.type === 'session.removed' || event.type === 'session.ended') {
      const sessionData = event.data as WebhookSessionData;
      const result = await handleSessionEnded(sessionData, event.type);
      if (result.isErr()) {
        console.error('Session ended handler error', {
          type: event.type,
          error: result.error,
          sessionId: sessionData.id,
          environment,
        });
        return err({ type: 'ProcessingError', error: result.error });
      }
      return ok(true);
    }

    // Handle user events with their specific data structure
    const userData = event.data as WebhookUserData;

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const result = await handleUserCreateOrUpdate(event.type, userData);
      if (result.isErr()) {
        console.error('User create/update handler error', {
          type: event.type,
          error: result.error,
          userId: userData.id,
          environment,
        });
        return err({ type: 'ProcessingError', error: result.error });
      }
      return ok(true);
    }

    if (event.type === 'user.deleted') {
      const result = await handleUserDeletion(userData);
      if (result.isErr()) {
        console.error('User deletion handler error', {
          type: event.type,
          error: result.error,
          userId: userData.id,
          environment,
        });
        return err({ type: 'ProcessingError', error: result.error });
      }
      return ok(true);
    }

    if (event.type === 'user.signed_in' || event.type === 'user.signed_out') {
      const result = await handleUserActivity(userData);
      if (result.isErr()) {
        console.error('User activity handler error', {
          type: event.type,
          error: result.error,
          userId: userData.id,
          environment,
        });
        return err({ type: 'ProcessingError', error: result.error });
      }
      return ok(true);
    }

    console.warn('Unhandled event type', {
      type: event.type,
      environment,
    });
    return ok(true);
  } catch (error) {
    console.error('Event processing error', {
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

  // Enhanced security: Validate webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing Clerk webhook secret - this is a security issue');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // Enhanced security: Validate required headers with detailed logging
  const headersList = await headers();
  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing required Svix headers – will ask Clerk to retry', {
      svixId: !!svixId,
      svixTimestamp: !!svixTimestamp,
      svixSignature: !!svixSignature,
      requestId: headersList.get('x-request-id') || 'unknown',
    });
    return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
  }

  // Enhanced security: Validate timestamp to prevent replay attacks
  const currentTime = Math.floor(Date.now() / 1000);
  const webhookTime = parseInt(svixTimestamp);
  const timeDiff = Math.abs(currentTime - webhookTime);

  // Reject webhooks older than 5 minutes (300 seconds)
  if (timeDiff > 300) {
    console.error('Webhook timestamp too old - potential replay attack', {
      currentTime,
      webhookTime,
      timeDiff,
      requestId: headersList.get('x-request-id') || 'unknown',
    });
    return NextResponse.json({ error: 'Request too old' }, { status: 400 });
  }

  // Verify webhook signature with enhanced error handling
  const verificationResult = await verifyWebhook(req, webhookSecret, {
    id: svixId,
    timestamp: svixTimestamp,
    signature: svixSignature,
  });

  // If verification fails, instruct Clerk to retry by returning 400. This is a transient
  // error (signature mismatch / missing headers) so we *want* Clerk to deliver again.
  if (verificationResult.isErr()) {
    console.error('Webhook verification failed – will ask Clerk to retry', {
      error: verificationResult.error,
      environment,
      requestId: headersList.get('x-request-id') || 'unknown',
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Process event with enhanced logging
  const event = verificationResult.value;
  console.info('Processing webhook event', {
    type: event.type,
    environment,
    userId: event.data.id,
    requestId: headersList.get('x-request-id') || 'unknown',
  });

  const result = await processEvent(event, environment);

  return result.match(
    () => {
      const duration = Date.now() - startTime;
      console.info('Webhook processed successfully', {
        duration: `${duration}ms`,
        environment,
        eventType: event.type,
        userId: event.data.id,
        requestId: headersList.get('x-request-id') || 'unknown',
      });
      return NextResponse.json({ success: true });
    },
    (error) => {
      const duration = Date.now() - startTime;
      console.error('Webhook processing failed', {
        duration: `${duration}ms`,
        error,
        environment,
        eventType: event.type,
        userId: event.data.id,
        requestId: headersList.get('x-request-id') || 'unknown',
      });

      // Return 500 for processing errors to signal Clerk should retry
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    },
  );
}
