# Production Environment Setup

This document outlines the required environment variables and configuration for production deployment to ensure proper security and feature restrictions.

## Critical Production Environment Variables

### Chat Feature Control
```bash
# MUST be set to 'false' or omitted entirely in production
# Only set to 'true' in development environments
NEXT_PUBLIC_ENABLE_CHAT_FEATURE=false
```

**Impact**: When `false` or omitted, this completely disables:
- Chat UI components in employee and therapist dashboards
- All chat API endpoints (`/api/chat/*`)
- Chat hooks and real-time messaging
- Chat preferences page for therapists

### Development-Only Endpoints
The following API endpoints are automatically restricted in production via `NODE_ENV` checks:
- `/api/dev/reset-stripe` - Stripe testing reset tool
- `/api/dev/test-subscription-sync` - Subscription sync testing
- `/dev/stripe-reset` - Development Stripe reset page

### Stripe Integration Restrictions
The Stripe integration page (`/therapist/integrations`) automatically:
- Hides Stripe integration cards in production
- Shows development-only warning messages when accessed
- Restricts Stripe onboarding flow to development only

## Required Production Environment Variables

### Database
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

### Authentication (Clerk)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/
```

### Stripe (if enabled in production)
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUBSCRIPTION_PRICE_ID_STARTER=price_...
```

### Analytics
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### KV Store (for subscription caching)
```bash
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

## Security Features Automatically Applied in Production

### 1. Development Endpoint Protection
All endpoints under `/api/dev/*` return 403 when `NODE_ENV !== 'development'`

### 2. Chat Feature Gating
Chat functionality is completely disabled unless `NEXT_PUBLIC_ENABLE_CHAT_FEATURE=true`

### 3. Stripe Integration Restrictions
- Stripe integration UI only shows in development
- Stripe onboarding flows are development-only
- Production displays clear warnings about development-only features

### 4. Debug Logging
- Stripe webhook debug logging only in development
- PostHog development mode detection
- Console.log statements should be removed in production builds

## Deployment Checklist

### Pre-Deployment
- [ ] Set `NEXT_PUBLIC_ENABLE_CHAT_FEATURE=false` (or omit)
- [ ] Verify all live Stripe keys are configured
- [ ] Confirm Clerk production keys are set
- [ ] Database connection string is production-ready
- [ ] KV store credentials are configured

### Post-Deployment Verification
- [ ] Chat features are not visible in UI
- [ ] `/api/dev/*` endpoints return 403
- [ ] Stripe integration shows development warnings
- [ ] No development debug logs in browser console
- [ ] Email eligibility works for authorized users

## Environment-Specific Feature Matrix

| Feature | Development | Production |
|---------|-------------|------------|
| Chat | ✅ (if enabled) | ❌ Always disabled |
| Stripe Integration UI | ✅ | ❌ Hidden |
| Stripe Payments | ✅ Test mode | ✅ Live mode |
| Dev API Endpoints | ✅ | ❌ 403 Forbidden |
| Debug Logging | ✅ | ❌ |
| Email Eligibility | ✅ | ✅ |

## Troubleshooting

### Chat Features Showing in Production
- Verify `NEXT_PUBLIC_ENABLE_CHAT_FEATURE` is not set to `'true'`
- Check browser cache and hard refresh
- Verify environment variables are properly loaded

### Stripe Integration Accessible
- Confirm `NODE_ENV=production` in deployment
- Check that development warnings are displayed
- Verify Stripe integration cards are hidden

### Development Endpoints Accessible
- Ensure `NODE_ENV=production` is set
- Verify deployment environment configuration
- Check API responses return 403 status codes

## Notes
- The `NODE_ENV` variable is automatically set by most hosting platforms
- All feature flags use environment variables for easy deployment control
- Security restrictions are built into the codebase, not just configuration 