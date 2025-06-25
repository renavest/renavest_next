/**
 * Billing Feature Exports
 *
 * Central export file for the billing feature.
 * All billing-related components, hooks, services, and types are exported from here.
 */

// Components
export { SubscriptionPlansCard } from './components/SubscriptionPlansCard';
export { default as PaymentMethodCard } from './components/PaymentMethodCard';
export { default as AddPaymentMethodForm } from './components/AddPaymentMethodForm';

// Hooks
export { useBillingManagement } from './hooks/useBillingManagement';

// Services
export { PaymentMethodsService } from './services/payment-methods';

// Types are imported directly from './types' to avoid duplication
// Example: import type { SubscriptionPlan, PaymentMethod } from '@/src/features/billing/types';
