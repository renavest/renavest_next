/**
 * Google Calendar Integration Feature
 *
 * This feature provides comprehensive Google Calendar integration for therapists,
 * including authentication, event management, and working hours configuration.
 */

// === Core Components ===
export { default as GoogleCalendarIntegration } from './components/GoogleCalendarIntegration';
export {
  WelcomeStep,
  PermissionsStep,
  ConnectStep,
  ResultStep,
  ConnectedStatus,
  DisconnectedStatus,
} from './components/GoogleCalendarSteps';
export { WorkingHoursSection } from './components/WorkingHoursSection';

// === Context & State ===
export {
  GoogleCalendarProvider,
  useGoogleCalendarContext,
  getTherapistStatus,
  updateTherapistStatus,
  clearGoogleCalendarCache,
  fetchTherapistId,
} from './context/GoogleCalendarContext';

// === Custom Hooks ===
export {
  useGoogleCalendarIntegration,
  useGoogleCalendarConnection,
  useGoogleCalendarError,
  useGoogleCalendarLoading,
} from './hooks/useGoogleCalendarIntegration';

// === Services ===
export {
  GoogleCalendarService,
  googleCalendarService,
  createGoogleCalendarService,
} from './services/googleCalendarService';

// === Utilities ===
export {
  createAndStoreGoogleCalendarEvent,
  isGoogleAuthError,
  disconnectTherapistGoogleCalendar,
  prepareTherapistCalendarAccess,
} from './utils/googleCalendar';
export { GoogleCalendarTokenManager, createTokenManager } from './utils/tokenManager';

// === Types ===
export type {
  // Core Integration Types
  GoogleCalendarTokens,
  GoogleCalendarCredentials,
  GoogleCalendarIntegrationStatus,
  GoogleCalendarIntegrationState,
  GoogleCalendarActions,

  // Database Entity Types
  TherapistWithCalendar,
  UserWithCalendar,
  BookingWithCalendar,

  // API Response Types
  GoogleCalendarStatusResponse,
  GoogleCalendarAuthResponse,
  GoogleCalendarEventResult,

  // Component Props Types
  GoogleCalendarIntegrationProps,
  GoogleCalendarStepProps,
  WelcomeStepProps,
  PermissionsStepProps,
  ConnectStepProps,
  ResultStepProps,
  ConnectedStatusProps,
  DisconnectedStatusProps,

  // Working Hours & Availability Types
  WorkingHours,
  BlockedTime,
  AvailabilitySlot,

  // Context Types
  GoogleCalendarContextValue,
  UseGoogleCalendarIntegrationReturn,

  // Utility Types
  GoogleCalendarError,
  TokenManagerConfig,
  TherapistTokenInfo,
  CalendarEventData,
  CalendarIntegrationConfig,
  GoogleCalendarProvider as GoogleCalendarProviderType,

  // API Parameter Types
  CreateCalendarEventParams,
  GetAvailabilityParams,
  ScheduleSessionParams,
} from './types';

// === Feature Metadata ===
export const GOOGLE_CALENDAR_FEATURE = {
  name: 'google-calendar',
  version: '1.0.0',
  description: 'Google Calendar integration for therapists with event management and availability',
  dependencies: [
    '@clerk/nextjs',
    'googleapis',
    'google-auth-library',
    '@preact-signals/safe-react',
    'drizzle-orm',
  ],
  apiEndpoints: [
    '/api/google-calendar',
    '/api/google-calendar/status',
    '/api/google-calendar/disconnect',
    '/api/google-calendar/auth/*',
  ],
} as const;
