import PostHogClient from '@/posthog';

import type { UserProperties } from './types';

/**
 * Server-side authentication tracking utilities for PostHog
 * Following ANALYTICS_POSTHOG MDC conventions
 */

interface AuthTrackingProps {
  [key: string]: unknown;
}

/**
 * Track user creation events from server-side (webhooks)
 */
export const trackUserCreatedServerSide = async (
  userId: string,
  userEmail: string,
  userRole: string,
  additionalProps: AuthTrackingProps = {},
) => {
  try {
    const posthogClient = PostHogClient();

    const userProperties: Partial<UserProperties> = {
      email: userEmail,
      role: userRole,
      signUpDate: new Date().toISOString(),
      lastActiveDate: new Date().toISOString(),
      isOnboarded: false,
    };

    posthogClient.capture({
      distinctId: userId,
      event: 'auth:user_created_server_v1',
      properties: {
        $set_once: {
          email: userEmail,
          role: userRole,
          email_domain: userEmail.split('@')[1],
          first_seen: new Date().toISOString(),
          signup_date: new Date().toISOString(),
        },
        $set: {
          last_seen: new Date().toISOString(),
          role: userRole,
        },
        user_id: userId,
        user_email: userEmail,
        user_role: userRole,
        email_domain: userEmail.split('@')[1],
        signup_method: 'email_password',
        server_timestamp: new Date().toISOString(),
        ...userProperties,
        ...additionalProps,
      },
    });

    await posthogClient.shutdown();
  } catch (error) {
    console.error('Error tracking user creation server-side:', error);
  }
};

/**
 * Track user login events from server-side (webhooks)
 */
export const trackUserLoginServerSide = async (
  userId: string,
  userEmail: string,
  userRole: string,
  additionalProps: AuthTrackingProps = {},
) => {
  try {
    const posthogClient = PostHogClient();

    posthogClient.capture({
      distinctId: userId,
      event: 'auth:user_login_server_v1',
      properties: {
        $set: {
          last_login: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          role: userRole,
        },
        user_id: userId,
        user_email: userEmail,
        user_role: userRole,
        email_domain: userEmail.split('@')[1],
        login_method: 'email_password',
        server_timestamp: new Date().toISOString(),
        ...additionalProps,
      },
    });

    await posthogClient.shutdown();
  } catch (error) {
    console.error('Error tracking user login server-side:', error);
  }
};

/**
 * Track user logout events from server-side
 */
export const trackUserLogoutServerSide = async (
  userId: string,
  userEmail: string,
  userRole: string,
  additionalProps: AuthTrackingProps = {},
) => {
  try {
    const posthogClient = PostHogClient();

    posthogClient.capture({
      distinctId: userId,
      event: 'auth:user_logout_server_v1',
      properties: {
        $set: {
          last_logout: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        },
        user_id: userId,
        user_email: userEmail,
        user_role: userRole,
        email_domain: userEmail.split('@')[1],
        server_timestamp: new Date().toISOString(),
        ...additionalProps,
      },
    });

    await posthogClient.shutdown();
  } catch (error) {
    console.error('Error tracking user logout server-side:', error);
  }
};

/**
 * Track user profile updates from server-side
 */
export const trackUserUpdatedServerSide = async (
  userId: string,
  userEmail: string,
  userRole: string,
  changedFields: string[] = [],
  additionalProps: AuthTrackingProps = {},
) => {
  try {
    const posthogClient = PostHogClient();

    posthogClient.capture({
      distinctId: userId,
      event: 'auth:user_updated_server_v1',
      properties: {
        $set: {
          last_updated: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          role: userRole,
        },
        user_id: userId,
        user_email: userEmail,
        user_role: userRole,
        email_domain: userEmail.split('@')[1],
        fields_changed: changedFields,
        fields_changed_count: changedFields.length,
        update_source: 'webhook',
        server_timestamp: new Date().toISOString(),
        ...additionalProps,
      },
    });

    await posthogClient.shutdown();
  } catch (error) {
    console.error('Error tracking user update server-side:', error);
  }
};

/**
 * Track user activity events (sign in/out) from server-side
 */
export const trackUserActivityServerSide = async (
  userId: string,
  userEmail: string,
  userRole: string,
  activityType: 'sign_in' | 'sign_out',
  additionalProps: AuthTrackingProps = {},
) => {
  try {
    const posthogClient = PostHogClient();

    posthogClient.capture({
      distinctId: userId,
      event: `auth:user_${activityType}_server_v1`,
      properties: {
        $set: {
          [`last_${activityType}`]: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          role: userRole,
        },
        user_id: userId,
        user_email: userEmail,
        user_role: userRole,
        email_domain: userEmail.split('@')[1],
        activity_type: activityType,
        server_timestamp: new Date().toISOString(),
        ...additionalProps,
      },
    });

    await posthogClient.shutdown();
  } catch (error) {
    console.error(`Error tracking user ${activityType} server-side:`, error);
  }
};
