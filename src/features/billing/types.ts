/**
 * Billing Feature Type Definitions
 *
 * This file contains all TypeScript interfaces and types used throughout
 * the billing feature to ensure type safety and consistency.
 */

// Core subscription types
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

// Stripe Payment Method types
export interface PaymentMethodCard {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
}

export interface PaymentMethod {
  id: string;
  type: string;
  card: PaymentMethodCard | null;
  created: number;
}

// API Response types
export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
  stripeCustomerId: string | null;
}

export interface SetupIntentResponse {
  clientSecret: string;
}

// Component prop types
export interface SubscriptionPlansCardProps {
  currentPlan?: string | null;
  hasEmployerSponsorship?: boolean;
  employerName?: string;
  onSubscribe: (priceId: string, isSponsored?: boolean) => Promise<void>;
  className?: string;
}

export interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onRemove: (paymentMethodId: string) => void;
  isRemoving: boolean;
}

export interface AddPaymentMethodFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Business logic types
export interface SponsorshipInfo {
  isSponsored: boolean;
  employerName?: string;
  coveragePercentage?: number;
  monthlyAllowance?: number;
  usedAllowance?: number;
}

import type { SubscriptionInfo } from '@/src/features/stripe/types';

export type SubscriptionStatus = SubscriptionInfo & {
  hasActiveSubscription: boolean;
  currentPlan?: string;
};

// Hook return types
export interface BillingManagementHook {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  addingNew: boolean;
  clientSecret: string | null;
  error: string | null;
  removing: string | null;
  handleAddPaymentMethod: () => Promise<void>;
  handleRemovePaymentMethod: (paymentMethodId: string) => Promise<void>;
  handleSetupSuccess: () => void;
  handleCancelAdd: () => void;
  setError: (error: string | null) => void;
}
