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
