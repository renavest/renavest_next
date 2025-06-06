# Subscription Gating Implementation

## Overview

This document describes the comprehensive subscription gating system implemented for Renavest's chat functionality. The system ensures that only users with active subscriptions can access premium features like direct messaging with therapists.

## Architecture

### Core Components

1. **Subscription Hook** (`src/hooks/useSubscription.ts`)
   - React hook for checking subscription status
   - Provides real-time subscription data
   - Handles loading states and error handling

2. **Subscription Gate Component** (`src/components/SubscriptionGate.tsx`)
   - UI component that wraps premium features
   - Shows upgrade prompts for non-subscribers
   - Includes professional checkout flow

3. **Subscription Middleware** (`src/middleware/subscription.ts`)
   - Server-side subscription validation
   - Protects API routes requiring active subscriptions
   - Supports both individual and employer-sponsored subscriptions

4. **Enhanced Webhook Handlers** (`src/features/stripe/utils/webhook-handlers.ts`)
   - Professional webhook handling for subscription events
   - Real-time subscription status synchronization
   - Robust error handling and retry logic

## Environment Variables Required

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_... # or sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUBSCRIPTION_PRICE_ID_STARTER=price_...

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID_STARTER=price_...
```

## Implementation Details

### 1. Chat Gating

The chat functionality is now protected at multiple levels:

**Frontend Protection:**
```tsx
// ChatSection.tsx
<SubscriptionGate
  feature="Direct Messaging"
  description="Connect with licensed therapists through secure, real-time messaging."
>
  {chatContent}
</SubscriptionGate>
```

**API Protection:**
```typescript
// chat/messaging/route.ts
const subscriptionCheck = await requireActiveSubscription(request);
if (subscriptionCheck) {
  return subscriptionCheck; // Returns 403 with upgrade info
}
```

### 2. Subscription Status Checking

The system checks subscription status through multiple layers:

1. **Real-time Stripe API** - Primary source of truth
2. **KV Cache** - Fast lookups for frequently accessed data
3. **Database Records** - Fallback and local storage
4. **Employer Benefits** - Corporate sponsorship checking

### 3. Webhook Handling

Professional webhook handling ensures subscription status is always up-to-date:

```typescript
// Subscription lifecycle events
case 'customer.subscription.created':
case 'customer.subscription.updated':
case 'customer.subscription.deleted':
  await handleSubscriptionUpdated(subscription);
  break;

// Payment events
case 'invoice.paid':
  await handleInvoicePaymentSucceeded(invoice);
  break;

case 'invoice.payment_failed':
  await handleInvoicePaymentFailed(invoice);
  break;
```

### 4. Employer Subsidies

The system supports employer-sponsored subscriptions:

- Automatic eligibility checking based on employer relationships
- Seamless integration with individual subscriptions
- Fallback mechanisms for corporate benefits

## User Experience Flow

### 1. First-Time User
1. User attempts to access chat
2. Subscription gate appears with feature highlights
3. "Start Free Trial" button creates Stripe checkout session
4. After payment, redirect to success page
5. Real-time subscription activation via webhooks
6. Immediate access to chat functionality

### 2. Existing Subscriber
1. Subscription hook checks status on page load
2. If active, chat loads immediately
3. If expired/failed, shows upgrade prompt
4. Seamless reactivation flow

### 3. Employer-Sponsored User
1. System checks employer relationship
2. If eligible, grants access without individual subscription
3. Transparent experience - user doesn't need to know about sponsorship

## Security Considerations

### 1. API Protection
- All chat endpoints protected by subscription middleware
- JWT token validation for user authentication
- Rate limiting and abuse prevention

### 2. Webhook Security
- Stripe signature verification
- Idempotent webhook processing
- Secure error handling without data leaks

### 3. Data Privacy
- Subscription status cached securely
- No sensitive payment data stored locally
- GDPR-compliant data handling

## Monitoring and Observability

### 1. Logging
```typescript
console.log(`[STRIPE WEBHOOK] Subscription ${subscription.status} for customer: ${customerId}`);
console.error('[SUBSCRIPTION MIDDLEWARE] Error checking subscription:', error);
```

### 2. Error Tracking
- Comprehensive error handling at all levels
- Graceful degradation when Stripe is unavailable
- Clear error messages for debugging

### 3. Metrics
- Subscription conversion rates
- Feature usage by subscription tier
- Churn analysis and prevention

## Testing Strategy

### 1. Unit Tests
- Subscription hook functionality
- Middleware protection logic
- Component rendering with different states

### 2. Integration Tests
- End-to-end subscription flow
- Webhook processing
- API protection verification

### 3. Manual Testing
- Stripe test mode integration
- Various subscription states
- Edge cases and error conditions

## Deployment Checklist

### Production Setup
- [ ] Environment variables configured
- [ ] Stripe webhooks endpoint configured
- [ ] Price IDs for all subscription tiers
- [ ] SSL certificate for webhook security
- [ ] Monitoring and alerting setup

### Stripe Configuration
- [ ] Products and prices created
- [ ] Webhook endpoints configured with correct events
- [ ] Tax settings (if applicable)
- [ ] Customer portal settings
- [ ] Trial period configuration

### Testing
- [ ] Test subscription flow with real Stripe test cards
- [ ] Verify webhook processing
- [ ] Test chat access gating
- [ ] Confirm employer subsidy logic
- [ ] Load test subscription checking

## Maintenance

### Regular Tasks
1. Monitor webhook delivery success rates
2. Review subscription analytics
3. Update Stripe API versions as needed
4. Refresh KV cache policies
5. Audit subscription access logs

### Troubleshooting
- Check webhook logs for failed deliveries
- Verify environment variables in production
- Monitor subscription sync failures
- Review customer support tickets for billing issues

## Future Enhancements

### Planned Features
1. Multiple subscription tiers with different feature access
2. Team/enterprise subscription management
3. Usage-based billing integration
4. Advanced analytics and reporting
5. Customer self-service portal
6. Automated dunning management

### Technical Improvements
1. Enhanced caching strategies
2. Real-time subscription status updates via WebSocket
3. Advanced fraud prevention
4. Multi-region webhook handling
5. GraphQL subscription APIs

## Support

For technical questions about the subscription implementation:
- Review webhook logs in Stripe dashboard
- Check application logs for subscription middleware
- Verify environment variables are correctly set
- Test subscription flow in Stripe test mode

For billing-related customer support:
- Direct users to /billing page for self-service
- Use Stripe customer portal for subscription management
- Reference session IDs for payment tracking
- Escalate complex billing issues to Stripe support 