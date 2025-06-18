// utils/authTracking.ts

import posthog from 'posthog-js';

// Placeholder file for authentication tracking utilities.
// Replace with your actual tracking logic (e.g., using Segment, Google Analytics, etc.)

interface TrackingProps {
  [key: string]: unknown;
}

interface UserContext {
  user_id?: string;
  email?: string;
  company_id?: string;
}

/**
 * Track authentication page views
 */
export const trackAuthPageView = (
  page_type: string,
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:page_viewed_v1', {
    page_type,
    url: window.location.href,
    viewed_timestamp: new Date().toISOString(),
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track login attempts
 */
export const trackLoginAttempt = (
  method: string = 'email_password',
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:login_attempted_v1', {
    method,
    attempted_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track successful login
 */
export const trackLoginSuccess = (
  method: string = 'email_password',
  userRole: string,
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:login_succeeded_v1', {
    method,
    user_role: userRole,
    success_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track login errors
 */
export const trackLoginError = (
  method: string = 'email_password',
  error: Error | string | unknown,
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  const errorMessage = error instanceof Error ? error.message : String(error);

  posthog.capture('auth:login_failed_v1', {
    method,
    error_message: errorMessage,
    error_type: error instanceof Error ? error.name : 'unknown',
    failed_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track signup step progression
 */
export const trackSignupStepComplete = (
  step_name: string,
  step_number: number,
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:signup_step_completed_v1', {
    step_name,
    step_number,
    completed_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track signup attempts
 */
export const trackSignupAttempt = (
  role: string,
  method: string = 'email_password',
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:signup_attempted_v1', {
    role,
    method,
    attempted_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track successful signup
 */
export const trackSignupSuccess = (
  role: string,
  method: string = 'email_password',
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:signup_succeeded_v1', {
    role,
    method,
    success_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track signup errors
 */
export const trackSignupError = (
  role: string,
  error: Error | string | unknown,
  method: string = 'email_password',
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  const errorMessage = error instanceof Error ? error.message : String(error);
  let errorCode = 'unknown';
  let isExistingAccountError = false;

  // Extract error code from Clerk errors
  if (error && typeof error === 'object' && 'errors' in error) {
    const clerkErrors = (error as { errors: Array<{ code?: string }> }).errors;
    errorCode = clerkErrors[0]?.code || 'unknown';

    // Flag specific existing account errors for better analytics
    isExistingAccountError = [
      'form_identifier_exists',
      'oauth_identification_claimed',
      'oauth_account_already_connected',
      'session_exists',
    ].includes(errorCode);
  }

  posthog.capture('auth:signup_failed_v1', {
    role,
    method,
    error_message: errorMessage,
    error_code: errorCode,
    error_type: error instanceof Error ? error.name : 'unknown',
    is_existing_account_error: isExistingAccountError,
    failed_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track email verification attempts
 */
export const trackEmailVerificationAttempt = (
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:email_verification_attempted_v1', {
    attempted_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track successful email verification
 */
export const trackEmailVerificationSuccess = (
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:email_verification_succeeded_v1', {
    success_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track password reset requests
 */
export const trackPasswordResetRequest = (
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:password_reset_requested_v1', {
    requested_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track password reset attempts
 */
export const trackPasswordResetAttempt = (
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:password_reset_attempted_v1', {
    attempted_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track successful password reset
 */
export const trackPasswordResetSuccess = (
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:password_reset_succeeded_v1', {
    success_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track password reset errors
 */
export const trackPasswordResetError = (
  error: Error | string | unknown,
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  const errorMessage = error instanceof Error ? error.message : String(error);
  let errorCode = 'unknown';

  // Extract error code from Clerk errors
  if (error && typeof error === 'object' && 'errors' in error) {
    const clerkErrors = (error as { errors: Array<{ code?: string }> }).errors;
    errorCode = clerkErrors[0]?.code || 'unknown';
  }

  posthog.capture('auth:password_reset_failed_v1', {
    error_message: errorMessage,
    error_code: errorCode,
    error_type: error instanceof Error ? error.name : 'unknown',
    failed_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};

/**
 * Track logout events
 */
export const trackLogout = (
  userRole?: string,
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:logout_v1', {
    user_role: userRole,
    logout_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });

  // Reset PostHog user context after logout
  posthog.reset();
};

/**
 * Identify user after successful authentication
 */
export const identifyAuthenticatedUser = (
  userId: string,
  userEmail: string,
  userRole: string,
  companyId?: string,
  companyName?: string,
  additionalProps: Record<string, unknown> = {},
) => {
  if (typeof window === 'undefined') return;

  // Identify user with PostHog
  posthog.identify(userId, {
    $set: {
      email: userEmail,
      role: userRole,
      email_domain: userEmail.split('@')[1],
      last_login: new Date().toISOString(),
      ...additionalProps,
    },
    $set_once: {
      first_login: new Date().toISOString(),
      signup_date: new Date().toISOString(),
    },
  });

  // Set up group analytics for B2B companies
  if (companyId && companyName) {
    posthog.group('company', companyId, {
      name: companyName,
      last_active: new Date().toISOString(),
    });
  }
};

/**
 * Track authentication flow abandonment
 */
export const trackAuthFlowAbandonment = (
  flow_type: 'login' | 'signup',
  last_step: string,
  additionalProps: TrackingProps = {},
  userContext: UserContext = {},
) => {
  if (typeof window === 'undefined') return;

  posthog.capture('auth:flow_abandoned_v1', {
    flow_type,
    last_step,
    abandoned_timestamp: new Date().toISOString(),
    url: window.location.href,
    ...userContext,
    ...additionalProps,
  });
};
