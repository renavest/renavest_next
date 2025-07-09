// src/config/billing.ts
// Billing, subscription plans, and pricing configuration

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Essential therapy sessions',
    price: 0,
    interval: 'month',
    stripePriceId: 'free',
    features: ['Book therapy sessions', 'Session history', 'Basic profile', 'Email support'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Enhanced therapy experience with messaging',
    price: 29,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || 'price_premium_monthly',
    features: [
      'Everything in Basic',
      'Direct messaging with therapists',
      'Priority booking',
      'Extended session notes',
      'Video call recordings (with consent)',
      '24/7 crisis support line',
    ],
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Complete mental health platform',
    price: 59,
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL || 'price_professional_monthly',
    features: [
      'Everything in Premium',
      'Group therapy sessions',
      'Wellness assessments',
      'Mental health analytics',
      'Custom treatment plans',
      'Dedicated account manager',
    ],
  },
] as const;

// Pricing scenarios for cost calculations
export const PRICING_SCENARIOS = [
  {
    id: 'individual_light',
    name: 'Individual - Light Usage',
    sessionsPerMonth: 1,
    description: 'Occasional therapy sessions',
  },
  {
    id: 'individual_regular',
    name: 'Individual - Regular Usage',
    sessionsPerMonth: 4,
    description: 'Weekly therapy sessions',
  },
  {
    id: 'individual_intensive',
    name: 'Individual - Intensive Usage',
    sessionsPerMonth: 8,
    description: 'Multiple sessions per week',
  },
] as const;

// Platform fee configuration
export const PLATFORM_FEE = {
  percentage: 0.20, // 20% platform fee
  minimumCents: 500, // $5.00 minimum fee
} as const;

// Therapist payout configuration
export const THERAPIST_PAYOUT = {
  percentage: 0.80, // 80% goes to therapist
  minimumSessionPrice: 5000, // $50.00 minimum session price in cents
  defaultSessionPrice: 15000, // $150.00 default session price in cents
} as const;

// Type exports
export type SubscriptionPlanId = typeof SUBSCRIPTION_PLANS[number]['id'];
export type PricingScenarioId = typeof PRICING_SCENARIOS[number]['id'];