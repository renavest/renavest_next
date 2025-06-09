export interface StripeSubCache {
  subscriptionId: string | null;
  status: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  planId: string | null;
  customerId: string | null;
}

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | null;

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'paid' | 'failed';
export type PayoutType = 'booking' | 'bonus' | 'adjustment';

// Additional Stripe component types
export interface ConnectStatus {
  connected: boolean;
  accountId?: string;
  onboardingStatus: 'not_started' | 'pending' | 'completed';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction?: boolean;
  requirements?: string[];
}

export interface StripeConnectIntegrationProps {
  therapistId: number;
}

export interface StripeStatus {
  connected: boolean;
  accountId?: string;
  onboardingStatus: 'not_started' | 'pending' | 'completed';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction?: boolean;
  requirements?: string[];
}
