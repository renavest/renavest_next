import posthog from 'posthog-js';

import { createDate } from '@/src/utils/timezone';

import { UserType } from '../types/auth';

export type AuthContext = {
  userId?: string | null;
  email?: string | null;
  role?: UserType | null;
  company?: string | null;
};

/**
 * Helper function to track auth-related events with a consistent format
 */
export const trackAuthEvent = (
  event_name: string,
  authContext: Partial<AuthContext> = {},
  additionalProps: Record<string, unknown> = {},
  userContext: { user_id?: string; company_id?: string } = {},
) => {
  if (typeof window === 'undefined') return;

  // Standardize event name and add versioning
  const formattedEvent = `auth:${event_name}_v1`;

  posthog.capture(formattedEvent, {
    ...authContext,
    ...userContext,
    ...additionalProps,
    tracked_timestamp: createDate().toISO(),
  });
};

/**
 * Track page view for authentication pages
 */
export const trackAuthPageView = (pagePath: string, authContext: Partial<AuthContext> = {}) => {
  trackAuthEvent('auth_page_viewed', authContext, {
    page_path: pagePath,
  });
};

/**
 * Track role selection during login/signup
 */
export const trackRoleSelection = (role: UserType, authContext: Partial<AuthContext> = {}) => {
  trackAuthEvent(
    'auth_role_selected',
    { ...authContext, role },
    {
      interaction_type: 'role_selected',
    },
  );
};

/**
 * Track login attempt
 */
export const trackLoginAttempt = (
  authMethod: 'google' | 'email' | 'microsoft',
  authContext: Partial<AuthContext> = {},
) => {
  trackAuthEvent('auth_login_attempt', authContext, {
    auth_method: authMethod,
    interaction_type: 'login_started',
  });
};

/**
 * Track login success
 */
export const trackLoginSuccess = (
  authMethod: 'google' | 'email' | 'microsoft',
  authContext: Partial<AuthContext> = {},
) => {
  trackAuthEvent('auth_login_success', authContext, {
    auth_method: authMethod,
  });
};

/**
 * Track login failure
 */
export const trackLoginError = (
  authMethod: 'google' | 'email' | 'microsoft',
  error: unknown,
  authContext: Partial<AuthContext> = {},
) => {
  trackAuthEvent('auth_login_error', authContext, {
    auth_method: authMethod,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
};

/**
 * Track signup attempt
 */
export const trackSignupAttempt = (
  authMethod: 'google' | 'email' | 'microsoft',
  authContext: Partial<AuthContext> = {},
) => {
  trackAuthEvent('auth_signup_attempt', authContext, {
    auth_method: authMethod,
  });
};

/**
 * Track signup success
 */
export const trackSignupSuccess = (
  authMethod: 'google' | 'email' | 'microsoft',
  authContext: Partial<AuthContext> = {},
) => {
  trackAuthEvent('auth_signup_success', authContext, {
    auth_method: authMethod,
  });
};

/**
 * Track signup error
 */
export const trackSignupError = (
  authMethod: 'google' | 'email' | 'microsoft',
  error: unknown,
  authContext: Partial<AuthContext> = {},
) => {
  trackAuthEvent('auth_signup_error', authContext, {
    auth_method: authMethod,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
};

/**
 * Track OAuth redirect
 */
export const trackOAuthRedirect = (
  provider: 'google' | 'microsoft',
  authContext: Partial<AuthContext> = {},
) => {
  trackAuthEvent('auth_oauth_redirect', authContext, {
    provider,
  });
};

// Call this on login/signup
export const identifyAndGroupUser = (
  userId: string,
  role: UserType,
  email: string,
  companyId?: string,
  companyName?: string,
) => {
  posthog.identify(userId, {
    role,
    email,
    email_domain: email?.split('@')[1],
  });
  if (companyId) {
    posthog.group('company', companyId, { name: companyName });
  }
};
