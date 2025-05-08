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
  eventName: string,
  authContext: Partial<AuthContext> = {},
  additionalProps: Record<string, unknown> = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture(eventName, {
    ...authContext,
    ...additionalProps,
    timestamp: createDate().toISO(),    
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
