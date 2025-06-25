# Pricing Feature

## Overview
Subscription plan management and display system for the Renavest platform, handling multiple pricing tiers and billing cycles.

## Structure
```
src/features/pricing/
├── components/
│   ├── PricingCard.tsx           # Individual plan display
│   ├── PricingComparison.tsx     # Feature comparison table
│   ├── SubscriptionManager.tsx   # Plan selection and changes
│   ├── BillingCycle.tsx          # Monthly/annual toggle
│   └── FeatureList.tsx           # Plan feature highlighting
├── data/                         # Pricing plan configurations
├── utils/                        # Pricing utilities and calculations
├── types.ts                      # Pricing and subscription types
├── index.ts                      # Feature exports
└── README.md                     # This documentation
```

## Features
- **Multi-Tier Plans**: Basic, Premium, Professional subscription tiers
- **Feature Comparison**: Clear feature differentiation between plans
- **Billing Cycles**: Monthly and annual billing options with discounts
- **Employer Sponsorship**: Company-sponsored employee access
- **Usage Limits**: Session limits and feature gates based on plan tier

## Usage

### Display Pricing Plans
```typescript
import { PricingCard, PricingComparison } from '@/src/features/pricing';

// Individual plan card
<PricingCard 
  tier="premium" 
  billing="annual" 
  showFeatures={true} 
/>

// Feature comparison table
<PricingComparison 
  highlightTier="premium"
  showEmployerPlans={true}
/>
```

### Subscription Management
```typescript
import { SubscriptionManager } from '@/src/features/pricing';

<SubscriptionManager 
  currentTier="basic"
  onPlanChange={handlePlanChange}
  allowUpgrade={true}
/>
```

## Pricing Tiers

### Individual Plans
1. **Basic Plan**: Limited sessions, basic features, individual payments
2. **Premium Plan**: Unlimited sessions, advanced features, priority support  
3. **Professional Plan**: Enterprise features, custom integrations, dedicated support

### Employer Plans
- **Bulk Pricing**: Volume discounts for employee groups
- **Admin Controls**: Manager oversight and usage analytics
- **Custom Integration**: API access and custom branding

## Environment Variables
```env
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL=price_xxx
```

## Integration Points
- **Stripe**: Subscription billing and plan management
- **Database**: User subscription status and plan history
- **Analytics**: Plan conversion and usage tracking 