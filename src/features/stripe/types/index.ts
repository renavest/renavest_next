/**
 * Stripe Feature Type Definitions
 *
 * Comprehensive TypeScript types for all Stripe-related functionality including
 * subscriptions, payments, Connect integration, and component props.
 */

// =============================================================================
// SUBSCRIPTION TYPES
// =============================================================================

/**
 * Cached subscription data structure stored in Redis/KV
 * Optimized for fast reads and minimal API calls to Stripe
 */
export interface StripeSubCache {
  /** Stripe subscription ID, null if no active subscription */
  subscriptionId: string | null;
  /** Current subscription status from Stripe */
  status: string | null;
  /** Unix timestamp when current billing period ends */
  currentPeriodEnd: number | null;
  /** Whether subscription will cancel at period end */
  cancelAtPeriodEnd: boolean;
  /** Stripe price ID for the subscribed plan */
  planId: string | null;
  /** Stripe customer ID associated with this subscription */
  customerId: string | null;
}

/**
 * Stripe subscription status values
 * @see https://stripe.com/docs/api/subscriptions/object#subscription_object-status
 */
export type SubscriptionStatus =
  | 'active' // Subscription is active and in good standing
  | 'canceled' // Subscription has been canceled
  | 'incomplete' // Initial payment failed, waiting for successful payment
  | 'incomplete_expired' // Initial payment failed and expired
  | 'past_due' // Payment failed, in grace period
  | 'trialing' // In trial period, no payment yet
  | 'unpaid' // Payment failed and past grace period
  | null; // No subscription

// =============================================================================
// PAYMENT TYPES
// =============================================================================

/**
 * Payment status for individual transactions
 */
export type PaymentStatus =
  | 'pending' // Payment intent created but not processed
  | 'completed' // Payment successfully captured
  | 'failed' // Payment failed permanently
  | 'refunded'; // Payment was refunded

/**
 * Therapist payout status
 */
export type PayoutStatus =
  | 'pending' // Payout scheduled but not sent
  | 'paid' // Payout successfully sent to therapist
  | 'failed'; // Payout failed

/**
 * Types of payouts to therapists
 */
export type PayoutType =
  | 'session_fee' // Payment for completed therapy session
  | 'bonus' // Performance or referral bonus
  | 'adjustment'; // Manual adjustment or correction

// =============================================================================
// STRIPE CONNECT TYPES
// =============================================================================

/**
 * Therapist Stripe Connect account status
 * Used for real-time display of onboarding progress
 */
export interface ConnectStatus {
  /** Whether the account is connected and can accept payments */
  connected: boolean;
  /** Stripe Connect account ID (starts with 'acct_') */
  accountId?: string;
  /** Current onboarding status */
  onboardingStatus: 'not_started' | 'pending' | 'completed';
  /** Whether the account can create charges */
  chargesEnabled: boolean;
  /** Whether the account can receive payouts */
  payoutsEnabled: boolean;
  /** Whether required business details are submitted */
  detailsSubmitted: boolean;
  /** Whether account requires additional actions */
  requiresAction?: boolean;
  /** List of missing requirements, if any */
  requirements?: string[];
}

/**
 * Legacy alias for ConnectStatus
 * @deprecated Use ConnectStatus instead
 */
export type StripeStatus = ConnectStatus;

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/**
 * Props for StripeConnectIntegration component
 */
export interface StripeConnectIntegrationProps {
  /** Database ID of the therapist setting up Connect */
  therapistId: number;
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

/**
 * Metadata structure for session-related payment intents
 */
export interface SessionPaymentMetadata {
  /** Booking session database ID */
  bookingSessionId: string;
  /** User database ID who made the payment */
  userId: string;
  /** Therapist database ID receiving the payment */
  therapistId: string;
  /** Session date for reference */
  sessionDate?: string;
}

/**
 * Configuration for Stripe payment capture
 */
export interface PaymentCaptureConfig {
  /** Whether to capture payment automatically or manually */
  captureMethod: 'automatic' | 'manual';
  /** Amount to capture in cents (optional, defaults to full amount) */
  amountToCapture?: number;
  /** Reason for partial capture */
  reason?: string;
}
