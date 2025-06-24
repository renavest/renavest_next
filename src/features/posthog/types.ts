// PostHog Analytics Types
// Isolated type definitions for analytics and tracking

// User Analytics Types
export interface UserIdentity {
  userId: string;
  email: string;
  role: 'employee' | 'therapist' | 'employer';
  companyId?: string;
  therapistId?: string;
}

export interface UserProperties {
  email: string;
  role: string;
  signUpDate: string;
  lastActiveDate: string;
  companyName?: string;
  isOnboarded: boolean;
  subscriptionTier?: string;
  therapistSpecializations?: string[];
}

// Event Types
export interface BaseEvent {
  event: string;
  distinctId: string;
  timestamp: Date;
  properties: Record<string, any>;
}

// Authentication Events
export interface AuthEvent extends BaseEvent {
  event: 'user_signed_in' | 'user_signed_out' | 'user_registered' | 'sso_login';
  properties: {
    authMethod: 'email' | 'google' | 'microsoft';
    userRole: string;
    isFirstLogin?: boolean;
  };
}

// Therapist Events
export interface TherapistEvent extends BaseEvent {
  event:
    | 'therapist_profile_updated'
    | 'therapist_availability_set'
    | 'therapist_connected_stripe'
    | 'therapist_connected_calendar'
    | 'therapist_session_completed'
    | 'therapist_client_notes_updated';
  properties: {
    therapistId: string;
    sessionCount?: number;
    specializations?: string[];
    hourlyRate?: number;
    calendarProvider?: string;
  };
}

// Booking Events
export interface BookingEvent extends BaseEvent {
  event:
    | 'session_booking_started'
    | 'session_booking_completed'
    | 'session_booking_cancelled'
    | 'session_reschedule_requested';
  properties: {
    sessionId: string;
    therapistId: string;
    clientId: string;
    sessionType: 'individual' | 'group';
    bookingSource: 'direct' | 'referral' | 'employer_sponsored';
    amount?: number;
  };
}

// Payment Events
export interface PaymentEvent extends BaseEvent {
  event:
    | 'payment_method_added'
    | 'subscription_created'
    | 'subscription_updated'
    | 'payment_succeeded'
    | 'payment_failed';
  properties: {
    amount?: number;
    currency: string;
    subscriptionTier?: string;
    paymentMethod: string;
    stripeCustomerId?: string;
  };
}

// Company Events
export interface CompanyEvent extends BaseEvent {
  event:
    | 'company_registered'
    | 'employee_invited'
    | 'bulk_subscription_created'
    | 'company_settings_updated';
  properties: {
    companyId: string;
    companySize?: number;
    industry?: string;
    employeeCount?: number;
    subscriptionType?: string;
  };
}

// Feature Usage Events
export interface FeatureEvent extends BaseEvent {
  event:
    | 'feature_accessed'
    | 'dashboard_viewed'
    | 'chat_message_sent'
    | 'document_uploaded'
    | 'calendar_synced';
  properties: {
    featureName: string;
    userRole: string;
    sessionDuration?: number;
    actionCount?: number;
  };
}

// Onboarding Events
export interface OnboardingEvent extends BaseEvent {
  event:
    | 'onboarding_started'
    | 'onboarding_step_completed'
    | 'onboarding_completed'
    | 'onboarding_abandoned';
  properties: {
    userRole: string;
    currentStep: number;
    totalSteps: number;
    completionRate: number;
    timeSpent?: number;
  };
}

// Union of all event types
export type AnalyticsEvent =
  | AuthEvent
  | TherapistEvent
  | BookingEvent
  | PaymentEvent
  | CompanyEvent
  | FeatureEvent
  | OnboardingEvent;

// PostHog Configuration
export interface PostHogConfig {
  apiKey: string;
  host?: string;
  debug?: boolean;
  autocapture?: boolean;
  capture_pageview?: boolean;
  disable_session_recording?: boolean;
}

// Tracking Context
export interface TrackingContext {
  page?: string;
  section?: string;
  userAgent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}
