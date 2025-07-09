// src/config/index.ts
// Centralized configuration exports

export * from './auth';
export * from './billing';
export * from './forms';

// Re-export commonly used configurations
export { ALLOWED_EMAILS, EMPLOYER_EMAIL_MAP, USER_ROLES, ROLE_ROUTES } from './auth';
export { SUBSCRIPTION_PLANS, PLATFORM_FEE, THERAPIST_PAYOUT } from './billing';
export { PURPOSE_OPTIONS, AGE_RANGE_OPTIONS, MARITAL_STATUS_OPTIONS, ETHNICITY_OPTIONS } from './forms';