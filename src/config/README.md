# Configuration Directory

This directory contains all centralized configuration files for the Renavest application. Constants and configurations have been moved here from scattered locations to improve maintainability and developer experience.

## Files Overview

### `app.ts`
- Application metadata and branding
- Feature flags and environment-specific settings
- Asset URLs and CDN configuration
- SEO and social media settings
- API and session configuration

### `auth.ts`
- Authentication and authorization settings
- User roles and permissions
- Route mappings for different user types
- Email allowlists and employer mappings
- Protected and public route definitions

### `billing.ts`
- Subscription plans and pricing
- Stripe configuration
- Platform fee and payout settings
- Pricing scenarios for calculations

### `forms.ts`
- Form options for onboarding flows
- Purpose, age range, marital status, and ethnicity options
- Centralized form validation configurations
- Type definitions for form values

### `index.ts`
- Centralized exports for easy importing
- Re-exports commonly used configurations

## Usage

Import configurations from the centralized location:

```typescript
// Import specific configurations
import { PURPOSE_OPTIONS, AGE_RANGE_OPTIONS } from '@/src/config/forms';
import { SUBSCRIPTION_PLANS, PLATFORM_FEE } from '@/src/config/billing';
import { USER_ROLES, ROLE_ROUTES } from '@/src/config/auth';
import { APP_CONFIG, FEATURE_FLAGS } from '@/src/config/app';

// Or import everything from index
import { PURPOSE_OPTIONS, SUBSCRIPTION_PLANS, USER_ROLES } from '@/src/config';
```

## Migration Notes

- **Legacy**: The original `/src/constants.ts` file has been updated to re-export from these new config files for backward compatibility
- **Components**: Form components have been updated to use the new centralized options
- **Types**: TypeScript types are now co-located with their respective configurations

## Benefits

1. **Single Source of Truth**: All configuration in one place
2. **Type Safety**: Proper TypeScript types for all configurations
3. **Easy Maintenance**: Changes to configurations happen in one location
4. **Better Developer Experience**: Clear organization and discoverability
5. **Consistent Imports**: Standardized import patterns across the application

## Adding New Configurations

When adding new configurations:

1. Choose the appropriate file (or create a new one if it's a distinct domain)
2. Export both the configuration and related TypeScript types
3. Add the export to `index.ts` if it's commonly used
4. Update this README with documentation