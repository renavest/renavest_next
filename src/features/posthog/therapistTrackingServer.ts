import PostHogClient from '@/posthog';

/**
 * Server-side therapist tracking (for API endpoints)
 */
export const trackTherapistServerSide = {
  profileUpdated: async (
    therapistId: number,
    changedFields: string[],
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    try {
      const posthogClient = PostHogClient();

      posthogClient.capture({
        distinctId: userContext.user_id || `therapist_${therapistId}`,
        event: 'therapist_profile:updated_server_v1',
        properties: {
          $set_once: userContext.email ? { email: userContext.email } : {},
          therapist_id: therapistId,
          fields_changed: changedFields,
          fields_changed_count: changedFields.length,
          updated_timestamp: new Date().toISOString(),
          ...userContext,
        },
      });

      await posthogClient.shutdown();
    } catch (error) {
      console.error('Error tracking therapist profile update:', error);
    }
  },

  clientAdded: async (
    therapistId: number,
    clientId: string,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    try {
      const posthogClient = PostHogClient();

      posthogClient.capture({
        distinctId: userContext.user_id || `therapist_${therapistId}`,
        event: 'therapist_clients:added_server_v1',
        properties: {
          $set_once: userContext.email ? { email: userContext.email } : {},
          therapist_id: therapistId,
          client_id: clientId,
          added_timestamp: new Date().toISOString(),
          ...userContext,
        },
      });

      await posthogClient.shutdown();
    } catch (error) {
      console.error('Error tracking therapist client addition:', error);
    }
  },

  sessionCreated: async (
    therapistId: number,
    sessionId: number,
    sessionType: 'scheduled' | 'direct_booking',
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    try {
      const posthogClient = PostHogClient();

      posthogClient.capture({
        distinctId: userContext.user_id || `therapist_${therapistId}`,
        event: 'therapist_sessions:created_server_v1',
        properties: {
          $set_once: userContext.email ? { email: userContext.email } : {},
          therapist_id: therapistId,
          session_id: sessionId,
          session_type: sessionType,
          created_timestamp: new Date().toISOString(),
          ...userContext,
        },
      });

      await posthogClient.shutdown();
    } catch (error) {
      console.error('Error tracking therapist session creation:', error);
    }
  },
};
