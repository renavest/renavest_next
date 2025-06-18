/**
 * Type definitions for Clerk webhook events and error handling.
 *
 * This file consolidates all webhook-related types to follow the project's
 * type organization pattern where each feature has its own types.ts file.
 */

// Webhook data structures from Clerk
export interface WebhookUserData {
  id: string;
  email_addresses: Array<{ email_address: string; id: string; verification?: { status: string } }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WebhookSessionData {
  id: string; // Session ID from Clerk
  user_id: string; // Clerk user ID
  status: string;
  created_at: string;
  ended_at?: string;
  metadata?: Record<string, unknown>;
}

// Error types for webhook processing
export type UserHandlingError =
  | { type: 'NoValidEmail'; userId: string }
  | { type: 'DatabaseError'; message: string; originalError: unknown };

export type SessionHandlingError =
  | { type: 'UserNotFound'; sessionId: string; clerkUserId: string }
  | { type: 'DatabaseError'; message: string; originalError: unknown };

export type WebhookError =
  | { type: 'UnknownEvent'; eventType: string }
  | { type: 'MalformedPayload'; error: unknown }
  | { type: 'MissingSecret' }
  | { type: 'MissingHeaders' }
  | { type: 'InvalidSignature'; error: unknown }
  | { type: 'ProcessingError'; error: unknown };

// Union type for all webhook event data
export type WebhookEventData = WebhookUserData | WebhookSessionData;

// Event type definitions for better type safety
export type UserWebhookEventType =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.signed_in'
  | 'user.signed_out';
export type SessionWebhookEventType = 'session.created' | 'session.ended' | 'session.removed';
export type WebhookEventType = UserWebhookEventType | SessionWebhookEventType;

// Generic webhook event structure
export interface WebhookEvent {
  type: WebhookEventType;
  data: WebhookEventData;
  object: 'event';
  evt_id?: string;
}
