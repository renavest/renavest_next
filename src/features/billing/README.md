# Billing Feature

## Overview

The billing feature handles subscription management, payment methods, and Stripe integration for the Renavest platform. It provides components and services for users to manage their subscription plans and payment information.

## Architecture

### Components
- **SubscriptionPlansCard**: Main component displaying available subscription plans with upgrade options
- **PaymentMethodCard**: Component for displaying and managing saved payment methods
- **AddPaymentMethodForm**: Stripe Elements-powered form for adding new payment methods

### Hooks
- **useBillingManagement**: Custom hook managing payment methods state and operations

### Services
- **PaymentMethodsService**: API service for Stripe payment method operations

### Types
Comprehensive TypeScript definitions for all billing-related data structures.

## File Structure

```
src/features/billing/
├── components/
│   ├── SubscriptionPlansCard.tsx    # Main subscription plans display
│   ├── PaymentMethodCard.tsx        # Individual payment method display
│   └── AddPaymentMethodForm.tsx     # New payment method form
├── hooks/
│   └── useBillingManagement.ts      # Payment methods management hook
├── services/
│   └── payment-methods.ts           # Stripe API service
├── types.ts                         # TypeScript definitions
├── index.ts                         # Feature exports
└── README.md                        # This file
```

## Usage

### Subscription Plans

```tsx
import { SubscriptionPlansCard } from '@/src/features/billing';

function BillingPage() {
  const handleSubscribe = async (priceId: string, isSponsored?: boolean) => {
    // Handle subscription logic
  };

  return (
    <SubscriptionPlansCard
      currentPlan="price_premium_monthly"
      hasEmployerSponsorship={false}
      onSubscribe={handleSubscribe}
    />
  );
}
```

### Payment Methods Management

```tsx
import { useBillingManagement, PaymentMethodCard, AddPaymentMethodForm } from '@/src/features/billing';

function PaymentMethodsPage() {
  const {
    paymentMethods,
    loading,
    addingNew,
    clientSecret,
    handleAddPaymentMethod,
    handleRemovePaymentMethod,
    handleSetupSuccess,
  } = useBillingManagement();

  return (
    <div>
      {paymentMethods.map((pm) => (
        <PaymentMethodCard
          key={pm.id}
          paymentMethod={pm}
          onRemove={handleRemovePaymentMethod}
          isRemoving={removing === pm.id}
        />
      ))}
      
      {addingNew && clientSecret && (
        <AddPaymentMethodForm
          onSuccess={handleSetupSuccess}
          onError={setError}
        />
      )}
    </div>
  );
}
```

## Key Features

### Subscription Plans
- Three-tier subscription model (Basic, Premium, Professional)
- Employer sponsorship support
- Environment-based Stripe price ID configuration
- Visual highlighting of current plans and popular options

### Payment Methods
- Secure payment method storage via Stripe
- Card brand detection and formatting
- Add/remove payment methods with proper error handling
- Loading states and user feedback

### Integration Points
- **Stripe**: Payment processing and secure tokenization
- **Clerk**: User authentication and session management
- **Toast Notifications**: User feedback via sonner

## Environment Variables

Required environment variables:
```env
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL=price_xxx
```

## API Endpoints

The feature expects these API endpoints to be available:
- `GET /api/stripe/payment-methods` - Fetch user's payment methods
- `POST /api/stripe/setup-intent` - Create Stripe SetupIntent
- `DELETE /api/stripe/payment-methods` - Remove payment method

## Error Handling

All components and hooks include comprehensive error handling:
- Network errors are caught and displayed to users
- Stripe-specific errors are formatted for better UX
- Loading states prevent double-submissions
- Toast notifications provide immediate feedback

## Type Safety

The feature uses strict TypeScript with:
- Isolated type definitions in `types.ts`
- Proper interface segregation
- Stripe-compatible type definitions
- Comprehensive prop type definitions

## Development Notes

- Payment methods are managed entirely through Stripe's secure vault
- All sensitive card data is handled by Stripe Elements
- Components are designed for responsive layouts
- Error states include specific messaging for different failure scenarios 