# Stripe Platform Setup for Renavest

## Overview
This document outlines the setup required for Renavest's platform account to receive the 10% platform fees from therapist session payments through Stripe Connect.

## Platform Account Requirements

### 1. Stripe Platform Account
- **Account Type**: Standard Stripe account (not Express or Custom)
- **Purpose**: Receive platform fees from Connect transactions
- **Revenue Share**: 10% of each session payment
- **Payout Schedule**: Standard (2-3 business days)

### 2. Environment Variables Required
```bash
# Stripe Platform Configuration
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_... for testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Must be public for client-side

# Platform Account Details
STRIPE_PLATFORM_ACCOUNT_ID=acct_... # Optional: for explicit platform operations
STRIPE_WEBHOOK_SECRET=whsec_... # For webhook signature verification

# Application Fee Configuration
STRIPE_APPLICATION_FEE_PERCENTAGE=0.10 # 10% platform fee
```

### 3. Stripe Connect Configuration
The platform is configured to collect application fees from each payment:

```typescript
// In session-payment API route
const applicationFeeAmount = Math.round(totalAmount * STRIPE_CONFIG.CONNECT.PLATFORM_PERCENTAGE);

const paymentIntent = await stripe.paymentIntents.create({
  amount: totalAmount,
  currency: 'usd',
  application_fee_amount: applicationFeeAmount, // 10% to platform
  transfer_data: {
    destination: therapist.stripeAccountId, // 90% to therapist
  },
  // ... other configuration
});
```

## Bank Account Setup Process

### 1. Stripe Dashboard Setup
1. **Log into Stripe Dashboard**: https://dashboard.stripe.com
2. **Navigate to Settings > Bank accounts and scheduling**
3. **Add business bank account**:
   - Account holder name: Renavest, Inc.
   - Account type: Business checking
   - Routing number: [Bank routing number]
   - Account number: [Bank account number]

### 2. Business Information Required
```
Business Legal Name: Renavest, Inc.
EIN/Tax ID: [Company EIN]
Business Type: Corporation/LLC
Industry: Technology - Financial Services
Website: https://renavestapp.com
Business Address: [Registered business address]
Phone: [Business phone number]
```

### 3. Compliance Requirements
- **Identity Verification**: Upload business formation documents
- **Bank Account Verification**: Stripe will make micro-deposits for verification
- **Business Verification**: Provide business license/registration
- **Representative Information**: Details of business owner/authorized representative

## Revenue Flow Configuration

### 1. Payment Flow Structure
```
Client Payment (e.g., $100)
├── Platform Fee (10% = $10) → Renavest Account
└── Therapist Payout (90% = $90) → Therapist Connect Account
```

### 2. Fee Collection Method
- **Application Fees**: Collected automatically with each payment
- **Direct Charges**: No additional setup required
- **Instant Transfer**: Fees are immediately available in platform account

### 3. Payout Schedule
- **Platform Fees**: Follow standard Stripe payout schedule (2-3 business days)
- **Therapist Payouts**: Handled separately through Connect transfers
- **Failed Payments**: Platform fees only collected on successful payments

## Webhook Configuration

### 1. Required Webhooks for Platform
```typescript
const PLATFORM_WEBHOOK_EVENTS = [
  'payment_intent.succeeded',      // Platform fee collection
  'payment_intent.payment_failed', // Failed payment handling
  'application_fee.created',       // Fee tracking
  'transfer.created',              // Therapist payout tracking
  'account.updated',               // Connect account status
];
```

### 2. Webhook Endpoint Setup
- **URL**: `https://renavestapp.com/api/webhooks/stripe`
- **Events**: Select events listed above
- **Secret**: Save webhook secret to environment variables

## Monitoring and Reporting

### 1. Revenue Tracking
- **Platform Fees**: Track in Stripe Dashboard under "Application fees"
- **Volume Metrics**: Monitor transaction volume and fee collection
- **Failed Payments**: Monitor failed payment rates and reasons

### 2. Financial Reconciliation
- **Daily Reporting**: Automated reports of fee collection
- **Monthly Statements**: Comprehensive revenue and payout summaries
- **Tax Reporting**: 1099 forms for therapist payments (if applicable)

## Security and Compliance

### 1. PCI Compliance
- **Level**: Determined by transaction volume
- **Requirements**: Follow Stripe's compliance guidelines
- **Monitoring**: Regular security assessments

### 2. Data Protection
- **Encryption**: All payment data encrypted in transit and at rest
- **Access Controls**: Limit access to financial data
- **Audit Logging**: Comprehensive logging of all financial operations

## Testing and Validation

### 1. Test Mode Setup
```bash
# Test Environment Variables
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Test Scenarios
- [ ] Process test payment with application fee
- [ ] Verify 10% fee collection in Stripe Dashboard
- [ ] Test therapist payout (90% transfer)
- [ ] Validate webhook delivery and processing
- [ ] Test failed payment handling

### 3. Go-Live Checklist
- [ ] Platform bank account verified and active
- [ ] Production API keys configured
- [ ] Webhook endpoints tested and verified
- [ ] Business information complete and verified
- [ ] First test transaction successful
- [ ] Financial reconciliation process tested

## Support and Maintenance

### 1. Stripe Support
- **Documentation**: https://stripe.com/docs/connect
- **Support**: Available through Stripe Dashboard
- **Community**: Stripe Developer Community

### 2. Internal Processes
- **Financial Reviews**: Monthly review of platform fees and payouts
- **System Monitoring**: Continuous monitoring of payment processing
- **Backup Procedures**: Contingency plans for payment processing issues

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Owner**: Engineering Team / Finance Team 