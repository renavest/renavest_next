/**
 * Stripe Feature - Main Exports
 *
 * Comprehensive payment processing, subscription management, and Connect integration
 * for the Renavest therapy platform.
 *
 * @example
 * ```typescript
 * import {
 *   getOrCreateStripeCustomer,
 *   syncStripeDataToKV,
 *   StripeConnectIntegration
 * } from '@/src/features/stripe';
 * ```
 */

// =============================================================================
// SERVICES & CONFIGURATION
// =============================================================================
export {
  stripe,
  STRIPE_CONFIG,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_APPEARANCE,
  PAYMENT_ELEMENT_OPTIONS,
  kv,
  CACHE_KEYS,
  SessionCompletionService,
} from './services';

// =============================================================================
// CORE UTILITIES
// =============================================================================
export {
  getOrCreateStripeCustomer,
  syncStripeDataToKV,
  getSubscriptionStatus,
  handleCheckoutSessionCompleted,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleSubscriptionUpdated,
} from './utils';

// =============================================================================
// UI COMPONENTS
// =============================================================================
export { StripeConnectIntegration } from './components';

// =============================================================================
// TYPE DEFINITIONS - REMOVED
// =============================================================================
// Types are imported directly from './types' to avoid duplication
// Example: import type { SubscriptionStatus, PaymentStatus } from '@/src/features/stripe/types';
