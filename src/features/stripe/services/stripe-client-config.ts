// Client-side Stripe configuration for Next.js
// This file handles the publishable key which needs to be prefixed with NEXT_PUBLIC_

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable. ' +
      'This should be set to your Stripe publishable key.',
  );
}

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
}

// Stripe appearance configuration for consistent UI
export const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#7c3aed', // Purple-600
    colorBackground: '#ffffff',
    colorText: '#1f2937', // Gray-800
    colorDanger: '#ef4444', // Red-500
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Input': {
      padding: '12px',
      border: '1px solid #d1d5db', // Gray-300
    },
  },
} as const;

// Payment element configuration
export const PAYMENT_ELEMENT_OPTIONS = {
  layout: 'tabs' as const,
  paymentMethodOrder: ['card'],
};
