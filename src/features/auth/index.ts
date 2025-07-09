// src/features/auth/index.ts
// Authentication feature exports

// Components
export { LoginPage } from './components/LoginPage';
export { SignupPage } from './components/SignupPage';
export { RenavestPurposeStep } from './components/onboarding/Purpose';

// Utilities
export { checkAuthState } from './utils/authChecker';
export { getRedirectUrl } from './utils/routeMapping';

// State
export * from './state/authState';

// Types
export type { OnboardingStep } from './types';