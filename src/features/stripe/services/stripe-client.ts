import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
});

// Stripe configuration constants
export const STRIPE_CONFIG = {
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
} as const;
