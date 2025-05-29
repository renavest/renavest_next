import posthog from 'posthog-js';

// Therapist-specific tracking utilities following ANALYTICS_POSTHOG MDC conventions

/**
 * Track therapist dashboard interactions
 */
export const trackTherapistDashboard = {
  // Dashboard page views
  pageViewed: (therapistId: number, userContext: { user_id?: string; email?: string } = {}) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_dashboard:page_viewed_v1', {
      therapist_id: therapistId,
      page_type: 'main_dashboard',
      viewed_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  // Profile interactions
  profileViewed: (therapistId: number, userContext: { user_id?: string; email?: string } = {}) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_dashboard:profile_viewed_v1', {
      therapist_id: therapistId,
      viewed_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  profileEditAttempted: (
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_dashboard:profile_edit_attempted_v1', {
      therapist_id: therapistId,
      action_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  profileEditSaved: (
    therapistId: number,
    changedFields: string[],
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_dashboard:profile_edit_saved_v1', {
      therapist_id: therapistId,
      fields_changed: changedFields,
      fields_changed_count: changedFields.length,
      action_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  profilePhotoUploaded: (
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_dashboard:profile_photo_uploaded_v1', {
      therapist_id: therapistId,
      action_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  // Navigation tracking
  navigationClicked: (
    linkName: string,
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_dashboard:navigation_clicked_v1', {
      link_name: linkName,
      therapist_id: therapistId,
      click_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  // Quick actions tracking
  quickActionClicked: (
    actionName: string,
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_dashboard:quick_action_clicked_v1', {
      action_name: actionName,
      therapist_id: therapistId,
      click_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },
};

/**
 * Track therapist client management interactions
 */
export const trackTherapistClientManagement = {
  clientListViewed: (
    therapistId: number,
    clientCount: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_clients:list_viewed_v1', {
      therapist_id: therapistId,
      client_count: clientCount,
      viewed_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  clientSelected: (
    therapistId: number,
    clientId: string,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_clients:client_selected_v1', {
      therapist_id: therapistId,
      client_id: clientId,
      selected_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  addClientModalOpened: (
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_clients:add_modal_opened_v1', {
      therapist_id: therapistId,
      opened_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },
};

/**
 * Track therapist session management
 */
export const trackTherapistSessions = {
  sessionsViewed: (
    therapistId: number,
    sessionCount: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_sessions:list_viewed_v1', {
      therapist_id: therapistId,
      session_count: sessionCount,
      viewed_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  sessionJoined: (
    therapistId: number,
    sessionId: number,
    joinMethod: 'google_meet' | 'other',
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_sessions:session_joined_v1', {
      therapist_id: therapistId,
      session_id: sessionId,
      join_method: joinMethod,
      joined_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },
};

/**
 * Track therapist integration management
 */
export const trackTherapistIntegrations = {
  integrationsPageViewed: (
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_integrations:page_viewed_v1', {
      therapist_id: therapistId,
      viewed_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  calendarConnectionAttempted: (
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_integrations:calendar_connection_attempted_v1', {
      therapist_id: therapistId,
      attempted_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  calendarConnectionSucceeded: (
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_integrations:calendar_connection_succeeded_v1', {
      therapist_id: therapistId,
      connected_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  calendarConnectionFailed: (
    therapistId: number,
    errorType: string,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_integrations:calendar_connection_failed_v1', {
      therapist_id: therapistId,
      error_type: errorType,
      failed_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  calendarDisconnected: (
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_integrations:calendar_disconnected_v1', {
      therapist_id: therapistId,
      disconnected_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  bankConnectionAttempted: (
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_integrations:bank_connection_attempted_v1', {
      therapist_id: therapistId,
      attempted_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  bankConnectionSucceeded: (
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_integrations:bank_connection_succeeded_v1', {
      therapist_id: therapistId,
      connected_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  bankConnectionFailed: (
    therapistId: number,
    errorType: string,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_integrations:bank_connection_failed_v1', {
      therapist_id: therapistId,
      error_type: errorType,
      failed_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },
};

/**
 * Track therapist marketplace interactions (when they browse other therapists)
 */
export const trackTherapistMarketplace = {
  marketplaceViewed: (
    therapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_marketplace:page_viewed_v1', {
      therapist_id: therapistId,
      viewed_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },

  therapistProfileViewed: (
    viewingTherapistId: number,
    viewedTherapistId: number,
    userContext: { user_id?: string; email?: string } = {},
  ) => {
    if (typeof window === 'undefined') return;

    posthog.capture('therapist_marketplace:therapist_profile_viewed_v1', {
      viewing_therapist_id: viewingTherapistId,
      viewed_therapist_id: viewedTherapistId,
      viewed_timestamp: new Date().toISOString(),
      url: window.location.href,
      ...userContext,
    });
  },
};
