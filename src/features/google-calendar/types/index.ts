/**
 * Google Calendar Integration Types
 *
 * This file centralizes all type definitions for the Google Calendar integration
 * to prevent type duplication and ensure consistency across the application.
 */

// shared types
import type {
  WorkingHours as SharedWorkingHours,
  AvailabilitySlot as SharedAvailabilitySlot,
} from '@/src/shared/types';

// === Core Google Calendar Types ===

export interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  scope?: string;
  token_type?: string;
}

export interface GoogleCalendarCredentials {
  googleCalendarAccessToken: string | null;
  googleCalendarRefreshToken: string | null;
  googleCalendarEmail: string | null;
  googleCalendarIntegrationStatus: GoogleCalendarIntegrationStatus;
  googleCalendarIntegrationDate?: Date | null;
}

export type GoogleCalendarIntegrationStatus = 'not_connected' | 'connected' | 'error' | 'pending';

// === Database Entity Types ===

export interface TherapistWithCalendar {
  id: number;
  userId: number;
  name: string;
  email?: string | null;
  googleCalendarAccessToken: string | null;
  googleCalendarRefreshToken: string | null;
  googleCalendarEmail: string | null;
  googleCalendarIntegrationStatus: GoogleCalendarIntegrationStatus;
  googleCalendarIntegrationDate?: Date | null;
  firstName?: string;
  lastName?: string;
}

export interface UserWithCalendar {
  id: number;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  isActive: boolean;
  therapistId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithCalendar {
  id: number;
  sessionStartTime: Date;
  sessionEndTime: Date;
  metadata: unknown;
  userId: string;
  therapistId: number;
  status: string;
  googleEventId: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// === Integration Status Types ===

export interface GoogleCalendarIntegrationState {
  isConnected: boolean | null;
  isLoading: boolean;
  calendarEmail?: string | null;
  lastSynced?: string | null;
  error?: string | null;
}

export interface GoogleCalendarActions {
  connect: () => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  reconnect: () => Promise<boolean>;
  refreshStatus: () => void;
}

// === API Response Types ===

export interface GoogleCalendarStatusResponse {
  success: boolean;
  therapistId?: number;
  isConnected: boolean;
  calendarEmail?: string | null;
  integrationStatus: GoogleCalendarIntegrationStatus;
  lastSynced?: string | null;
  message?: string;
  error?: string;
}

export interface GoogleCalendarAuthResponse {
  success: boolean;
  message: string;
  calendarEmail?: string;
  authUrl?: string;
  error?: string;
}

export interface GoogleCalendarEventResult {
  eventId?: string;
  eventLink?: string;
  googleMeetLink?: string;
}

// === Token Manager Types ===

export interface TokenManagerConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TherapistTokenInfo {
  id: number;
  googleCalendarAccessToken: string | null;
  googleCalendarRefreshToken: string | null;
  googleCalendarIntegrationStatus: GoogleCalendarIntegrationStatus;
}

// === Component Props Types ===

export interface GoogleCalendarIntegrationProps {
  therapistId?: string | number;
  showAvailabilityLink?: boolean;
  onStatusChange?: (status: GoogleCalendarIntegrationState) => void;
}

export interface GoogleCalendarStepProps {
  onNext?: () => void;
  onClose?: () => void;
  onRetry?: () => void;
  onConnect?: () => void;
  onReconnect?: () => void;
  onDisconnect?: () => void;
}

export interface WelcomeStepProps extends Pick<GoogleCalendarStepProps, 'onNext'> {}

export interface PermissionsStepProps extends Pick<GoogleCalendarStepProps, 'onNext'> {}

export interface ConnectStepProps extends Pick<GoogleCalendarStepProps, 'onConnect'> {
  isLoading: boolean;
  therapistId: string | null;
  error: string | null;
}

export interface ResultStepProps extends Pick<GoogleCalendarStepProps, 'onClose' | 'onRetry'> {
  isConnected: boolean;
  calendarEmail: string | null | undefined;
  lastSynced: string | null | undefined;
}

export interface ConnectedStatusProps
  extends Pick<GoogleCalendarStepProps, 'onReconnect' | 'onDisconnect'> {
  calendarEmail: string | null | undefined;
  lastSynced: string | null | undefined;
  isLoading: boolean;
}

export interface DisconnectedStatusProps extends Pick<GoogleCalendarStepProps, 'onConnect'> {
  error: string | null | undefined;
  isLoading: boolean;
}

// === Calendar Event Types ===

export interface CalendarEventData {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    email: string;
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
    };
  };
}

// === Working Hours & Availability Types ===

export type WorkingHours = SharedWorkingHours;

export interface BlockedTime {
  id: string;
  startTime: Date;
  endTime: Date;
  reason?: string;
  isRecurring: boolean;
}

export type AvailabilitySlot = SharedAvailabilitySlot & {
  startTime?: Date;
  endTime?: Date;
};

// === Error Types ===

export interface GoogleCalendarError extends Error {
  code?: number | string;
  response?: {
    status?: number;
    data?: any;
  };
  isAuthError?: boolean;
}

// === Utility Types ===

export type GoogleCalendarProvider = 'google';

export interface CalendarIntegrationConfig {
  provider: GoogleCalendarProvider;
  scopes: string[];
  accessType: 'offline' | 'online';
  prompt?: 'consent' | 'select_account' | 'none';
}

// === Hook Return Types ===

export interface UseGoogleCalendarIntegrationReturn {
  status: GoogleCalendarIntegrationState;
  actions: GoogleCalendarActions;
  therapistId: string | null;
}

// === Context Types ===

export interface GoogleCalendarContextValue {
  status: GoogleCalendarIntegrationState;
  actions: GoogleCalendarActions;
  therapistId: string | null;
  isValidTherapistId: boolean;
}

// === API Parameter Types ===

export interface CreateCalendarEventParams {
  booking: BookingWithCalendar;
  therapist: TherapistWithCalendar;
  user: UserWithCalendar;
}

export interface GetAvailabilityParams {
  therapistId: number;
  startDate: string;
  endDate: string;
  timezone: string;
  view?: 'client' | 'therapist';
}

export interface ScheduleSessionParams {
  clientId: number;
  sessionStartTime: string;
  sessionEndTime: string;
  timezone: string;
}
