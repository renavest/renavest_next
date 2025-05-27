import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

// Initialize Stripe with latest API version and TypeScript support
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil', // Latest API version as of 2025
  typescript: true,
  telemetry: false, // Disable telemetry for privacy
  timeout: 20000, // 20 second timeout
  maxNetworkRetries: 3, // Retry failed requests
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
  // API version for consistency
  API_VERSION: '2025-04-30.basil' as const,

  // Price IDs for different plans
  PLANS: {
    STARTER: process.env.STRIPE_PRICE_ID_STARTER!,
    PROFESSIONAL: process.env.STRIPE_PRICE_ID_PROFESSIONAL!,
    ENTERPRISE: process.env.STRIPE_PRICE_ID_ENTERPRISE!,
  },

  // Webhook endpoint secret
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,

  // Connect platform settings
  CONNECT: {
    THERAPIST_PERCENTAGE: 0.9, // Therapists get 90%
    PLATFORM_PERCENTAGE: 0.1, // Platform gets 10%
  },

  // Payment settings
  PAYMENT: {
    // Default capture method - automatic_async is now default as of 2024-04-10
    DEFAULT_CAPTURE_METHOD: 'automatic_async' as const,
    // Currency
    DEFAULT_CURRENCY: 'usd' as const,
    // Statement descriptor limits
    STATEMENT_DESCRIPTOR_MAX_LENGTH: 22,
    // Timeout settings
    PAYMENT_TIMEOUT_MINUTES: 30,
  },

  // Security settings
  SECURITY: {
    // Webhook signature tolerance (5 minutes default)
    WEBHOOK_TOLERANCE: 300,
    // Enable automatic payment methods by default (2023-08-16 change)
    AUTOMATIC_PAYMENT_METHODS_DEFAULT: true,
  },
} as const;
