// Billing Feature Types

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

export interface SubscriptionPlansCardProps {
  currentPlan?: string | null;
  hasEmployerSponsorship?: boolean;
  employerName?: string;
  onSubscribe: (priceId: string, isSponsored?: boolean) => Promise<void>;
  className?: string;
}

export interface PaymentMethodCardProps {
  paymentMethod: any; // Stripe PaymentMethod type
  isDefault: boolean;
  onSetDefault: (paymentMethodId: string) => Promise<void>;
  onDelete: (paymentMethodId: string) => Promise<void>;
}

export interface AddPaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Page-specific interfaces
export interface PaymentMethodsSectionProps {
  hasPaymentMethods: boolean;
  defaultPaymentMethodId: string | null;
  onRefresh: () => void;
}

export interface SponsorshipInfo {
  isSponsored: boolean;
  employerName?: string;
  coveragePercentage?: number;
  monthlyAllowance?: number;
  usedAllowance?: number;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  currentPlan?: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface BillingSetupFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}
