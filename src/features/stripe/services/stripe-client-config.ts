// Client-side Stripe configuration for Next.js
// This file handles the publishable key which needs to be prefixed with NEXT_PUBLIC_

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required for client-side Stripe initialization',
  );
}

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Stripe appearance configuration for consistent UI
export const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#7c3aed',
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    colorDanger: '#ef4444',
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
} as const;

// Payment element configuration
export const PAYMENT_ELEMENT_OPTIONS = {
  layout: 'tabs',
  paymentMethodOrder: ['card'],
};
