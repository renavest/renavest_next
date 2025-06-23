# Stripe Feature

The Stripe feature handles all payment processing, subscription management, and therapist payout functionality for the Renavest platform.

## Overview

This feature integrates Stripe for:
- **Subscription Management**: Employee subscription plans with billing cycles
- **Session Payments**: Individual therapy session payments with manual capture
- **Therapist Payouts**: Connect integration for therapist payment distribution
- **Payment Methods**: Secure storage and management of customer payment data
- **Webhooks**: Real-time synchronization of payment status changes

## Architecture

### Core Services
- **Stripe Client** (`services/stripe-client.ts`): Main Stripe SDK initialization and configuration
- **Client Config** (`services/stripe-client-config.ts`): Frontend Stripe Elements configuration
- **KV Cache** (`services/kv-cache.ts`): Redis caching for subscription data
- **Session Completion** (`services/session-completion.ts`): Automated session payment processing

### Utilities
- **Stripe Operations** (`utils/stripe-operations.ts`): Core customer and subscription operations
- **Webhook Handlers** (`utils/webhook-handlers.ts`): Stripe webhook event processing

### Components
- **StripeConnectIntegration** (`components/StripeConnectIntegration.tsx`): Therapist bank account connection UI

## Key Flows

### 1. Subscription Management
```typescript
// Create or retrieve Stripe customer
const customerId = await getOrCreateStripeCustomer(userId, userEmail);

// Sync subscription data to cache
const subscriptionData = await syncStripeDataToKV(customerId);

// Check subscription status
const status = await getSubscriptionStatus(customerId);
```

### 2. Session Payments
1. **Payment Intent Creation**: Created with `capture_method: 'manual'`
2. **Authorization**: Payment method authorized but not captured
3. **Session Completion**: Therapist marks session complete
4. **Payment Capture**: Funds captured automatically via webhook or cron job

### 3. Therapist Connect Integration
1. **OAuth Flow**: Therapist redirected to Stripe Connect onboarding
2. **Account Verification**: Stripe verifies business information
3. **Payout Setup**: Bank account details collected by Stripe
4. **Status Monitoring**: Real-time updates via webhooks

## Configuration

### Environment Variables
```env
# Server-side Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Client-side Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Subscription Price IDs
NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID_STARTER=price_...

# Redis Cache
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Platform Settings
- **Therapist Cut**: 90% (configurable in `STRIPE_CONFIG.CONNECT`)
- **Platform Fee**: 10%
- **Payment Capture**: Manual for sessions, automatic for subscriptions
- **Webhook Tolerance**: 5 minutes for signature verification

## API Integration

### Required Endpoints
- `POST /api/stripe/billing-setup-check` - Verify customer payment methods
- `GET /api/stripe/connect/status` - Therapist Connect account status
- `POST /api/stripe/connect/oauth` - Initiate Connect onboarding
- `POST /api/stripe/webhooks/stripe` - Process Stripe webhook events

### Database Schema Dependencies
```sql
-- Core tables required
stripe_customers (userId, stripeCustomerId)
session_payments (bookingSessionId, stripePaymentIntentId, status)
therapist_payouts (therapistId, amountCents, stripeTransferId)
therapists (stripeAccountId, chargesEnabled, payoutsEnabled)
users (subscriptionStatus, stripeSubscriptionId)
```

## Error Handling

### Payment Failures
- **Insufficient Funds**: Automatic retry with exponential backoff
- **Card Declined**: User notified to update payment method
- **Authentication Required**: 3D Secure challenge presented

### Webhook Resilience
- **Signature Verification**: All webhooks validated before processing
- **Idempotency**: Duplicate event handling prevents double processing
- **Retry Logic**: Failed webhook processing triggers automatic retries

## Security Considerations

### PCI Compliance
- **No Card Data Storage**: All sensitive data handled by Stripe
- **Tokenization**: Payment methods stored as Stripe tokens only
- **Webhook Signatures**: All events cryptographically verified

### Access Control
- **Customer Isolation**: Users can only access their own payment data
- **Therapist Verification**: Connect accounts verified before payout eligibility
- **API Key Security**: Server-side keys never exposed to client

## Monitoring & Analytics

### Key Metrics
- **Subscription Health**: Active/cancelled subscription ratios
- **Payment Success Rates**: Authorization vs. capture success
- **Therapist Onboarding**: Connect completion rates
- **Revenue Tracking**: Platform fees and therapist payouts

### Logging
- **Payment Events**: All payment state changes logged with context
- **Error Tracking**: Failed payments and webhook processing
- **Performance Metrics**: API response times and retry counts

## Development Notes

### Testing
```bash
# Install Stripe CLI for webhook testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test webhook events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
```

### Common Patterns
```typescript
// Always use retry logic for Stripe API calls
const result = await retryService.executeWithRetry(
  () => stripe.paymentIntents.capture(paymentIntentId),
  logContext,
  'payment_capture'
);

// Cache subscription data after any changes
await syncStripeDataToKV(customerId);

// Use structured logging for debugging
paymentLogger.paymentCaptured(context, { attempts, totalTime });
```

### Troubleshooting
- **Webhook Delays**: Check Stripe Dashboard for webhook delivery status
- **Payment Stuck**: Verify PaymentIntent status in Stripe Dashboard
- **Connect Issues**: Review therapist onboarding requirements
- **Cache Inconsistency**: Manually refresh via `syncStripeDataToKV`

## Migration Notes

When transferring this codebase:
1. **Environment Setup**: Ensure all Stripe keys are configured correctly
2. **Webhook Endpoints**: Update webhook URLs in Stripe Dashboard
3. **Database Migration**: Run latest Drizzle migrations for schema compatibility
4. **Connect Settings**: Verify platform settings in Stripe Connect dashboard
5. **Testing**: Test full payment flows in Stripe test mode before going live

## Support

For Stripe-specific issues:
- Check Stripe Dashboard logs and webhook delivery
- Review Stripe API documentation for latest changes
- Monitor rate limits and API usage patterns
- Ensure webhook endpoint SSL certificate validity 