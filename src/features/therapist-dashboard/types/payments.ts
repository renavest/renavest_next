// Payment and bank account integration types
export interface StripeConnectStatus {
  connected: boolean;
  accountId?: string;
  onboardingStatus: 'not_started' | 'pending' | 'completed';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction?: boolean;
  requirements?: string[];
}

export interface PaymentSettings {
  stripeConnectStatus: StripeConnectStatus;
  hourlyRateCents?: number;
  acceptingPayments: boolean;
  bankAccountConnected: boolean;
}

export interface SessionPayment {
  id: string;
  sessionId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stripePaymentIntentId?: string;
  therapistEarnings: number;
  platformFee: number;
  completedAt?: Date;
  transferredAt?: Date;
}

export interface PaymentIntegrationState {
  stripeConnectStatus: StripeConnectStatus;
  loading: boolean;
  connecting: boolean;
  error: string | null;
}

export interface PaymentIntegrationActions {
  fetchStatus: () => Promise<void>;
  initiateConnection: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshOnboarding: () => Promise<void>;
}

// Global payment state for avoiding prop drilling
export interface TherapistPaymentState {
  paymentSettings: PaymentSettings;
  sessionPayments: SessionPayment[];
  integrationState: PaymentIntegrationState;
}
