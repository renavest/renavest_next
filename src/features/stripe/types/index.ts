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
  isConnected: boolean;
  accountId?: string;
  hasRequiredInfo: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements?: Record<string, unknown>;
}

export interface StripeConnectIntegrationProps {
  therapistId: number;
  onStatusUpdate: (status: ConnectStatus) => void;
}

export interface StripeStatus {
  isConnected: boolean;
  accountId?: string;
  hasRequiredInfo: boolean;
  canReceivePayments: boolean;
  requirements?: string[];
}
