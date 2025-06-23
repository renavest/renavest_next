/**
 * Employee Dashboard Feature Types
 *
 * This file contains all TypeScript type definitions for the employee dashboard feature.
 * Types are organized by functional area for better maintainability.
 */

import { ReactNode } from 'react';

// =====================================
// Core Dashboard Types
// =====================================

/**
 * Main dashboard content component props
 */
export interface DashboardContentProps {
  /** Whether the user has completed the financial therapy assessment quiz */
  hasCompletedQuiz: boolean;
  /** Callback when user clicks to take the quiz */
  onTakeQuizClick: () => void;
  /** Callback when user clicks to share referral link */
  onShareClick: () => void;
  /** The user's referral link for sharing */
  referralLink: string;
  /** Callback to control financial therapy modal visibility */
  setIsFinancialTherapyModalOpen: (isOpen: boolean) => void;
}

/**
 * Limited dashboard client component props for subscription-gated content
 */
export interface LimitedDashboardClientProps {
  /** Optional CSS class name */
  className?: string;
}

// =====================================
// Therapist Related Types
// =====================================

/**
 * Individual therapist information
 */
export interface Therapist {
  /** Unique therapist identifier */
  id: number;
  /** Full name of the therapist */
  name: string;
  /** Professional title or specialization */
  title: string;
  /** URL to therapist's profile image */
  profileUrl: string;
  /** Brief description or preview text about the therapist */
  previewBlurb: string;
  /** Optional booking URL for external scheduling */
  bookingURL?: string;
  /** Whether the therapist profile is pending approval */
  isPending?: boolean;
  /** Therapist's area of specialty */
  specialty?: string;
  /** Next available appointment time */
  nextAvailable?: string;
  /** Algorithm-generated match score (0-100) */
  matchScore?: number;
  /** Profile image URL */
  imageUrl?: string;
}

/**
 * Props for therapist recommendations component
 */
export interface TherapistRecommendationsProps {
  /** Whether to show the "View All" button */
  showViewAllButton?: boolean;
  /** Callback when user clicks to take quiz */
  onTakeQuizClick?: () => void;
  /** Whether user has completed the assessment quiz */
  hasCompletedQuiz?: boolean;
}

/**
 * Props for therapist recommendations with overlay component
 */
export interface TherapistRecommendationsWithOverlayProps {
  /** Child components to render */
  children?: ReactNode;
  /** Callback when user clicks to take quiz */
  onTakeQuizClick: () => void;
  /** Whether user has completed the assessment quiz */
  hasCompletedQuiz: boolean;
}

// =====================================
// Chat Related Types
// =====================================

/**
 * Individual chat message
 */
export interface Message {
  /** Unique message identifier */
  id: number;
  /** Message identifier for tracking */
  messageId: string;
  /** ID of the user who sent the message */
  senderId: number;
  /** Message content/text */
  content: string;
  /** Type of message (text, image, file, etc.) */
  messageType: string;
  /** Message delivery status */
  status: string;
  /** Timestamp when message was sent */
  sentAt: string;
  /** First name of message sender */
  senderFirstName: string;
  /** Last name of message sender */
  senderLastName: string;
  /** Email address of message sender */
  senderEmail: string;
}

/**
 * Chat channel information
 */
export interface Channel {
  /** Unique channel identifier */
  id: number;
  /** Unique channel identifier string */
  channelIdentifier: string;
  /** ID of the therapist in this channel */
  therapistId: number;
  /** ID of the prospective user/client */
  prospectUserId: number;
  /** Current status of the channel */
  status: string;
  /** Timestamp of the last message */
  lastMessageAt: string;
  /** Preview text of the last message */
  lastMessagePreview: string;
  /** Number of unread messages */
  unreadCount: number;
  /** Optional therapist name for display */
  therapistName?: string;
  /** Optional therapist title for display */
  therapistTitle?: string;
  /** Optional prospect first name */
  prospectFirstName?: string;
  /** Optional prospect last name */
  prospectLastName?: string;
  /** Optional prospect email */
  prospectEmail?: string;
}

// =====================================
// Modal Component Props
// =====================================

/**
 * Props for the financial therapy assessment quiz modal
 */
export interface QuizModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when quiz is submitted with answers */
  onSubmit: (answers: Record<string, string>) => void;
}

/**
 * Props for the financial therapy information modal
 */
export interface FinancialTherapyModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * Props for the consultation banner component
 */
export interface ConsultationBannerProps {
  /** Callback when user clicks to book a consultation */
  onBookConsultation: () => void;
}

// =====================================
// Sharing and Referral Types
// =====================================

/**
 * Props for the referral share panel component
 */
export interface SharePanelProps {
  /** The referral code to share */
  referralCode?: string;
  /** The full referral link to share */
  referralLink?: string;
  /** Callback when user clicks to share */
  onShareClick?: () => void;
}

// =====================================
// Insights and Analytics Types
// =====================================

/**
 * Individual financial goal tracking
 */
export interface FinancialGoal {
  /** Unique goal identifier */
  id: number;
  /** Goal title/name */
  title: string;
  /** Target amount or value */
  target: number;
  /** Current progress amount */
  current: number;
  /** Category of goal (savings, spending, etc.) */
  category: 'savings' | 'spending' | 'investment' | 'debt';
  /** Timeline for achieving the goal */
  timeframe: string;
  /** Detailed description of the goal */
  description: string;
}

/**
 * Actionable financial insight with spending/savings data
 */
export interface ActionableInsight {
  /** Unique insight identifier */
  id: number;
  /** Amount spent in the analyzed period */
  spending: number;
  /** Potential savings amount */
  savings: number;
  /** User-friendly message about spending */
  message: {
    prefix: string;
    amount: string;
    suffix: string;
  };
  /** Impact message about potential savings */
  impact: {
    prefix: string;
    amount: string;
    suffix: string;
  };
}

/**
 * Comparison data for progress charts
 */
export interface ComparisonDataPoint {
  /** Name/label of the data point */
  name: string;
  /** Previous period value */
  past: number;
  /** Current period value */
  current: number;
}

// =====================================
// Form and Document Types
// =====================================

/**
 * Client form field definition
 */
export interface ClientFormField {
  /** Unique field identifier */
  id: string;
  /** Field input type */
  type: 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date';
  /** Field label text */
  label: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required: boolean;
  /** Options for select/radio/checkbox fields */
  options?: string[];
  /** Validation rules */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

/**
 * Client form assignment from therapist
 */
export interface ClientFormAssignment {
  /** Unique assignment identifier */
  id: string;
  /** Form template identifier */
  formId: string;
  /** Display title of the form */
  formTitle: string;
  /** Optional form description */
  formDescription?: string;
  /** Form field definitions */
  fields: ClientFormField[];
  /** Current status of the assignment */
  status: 'sent' | 'completed' | 'expired';
  /** When the form was sent */
  sentAt: string;
  /** When the form was completed (if applicable) */
  completedAt?: string;
  /** When the form expires (if applicable) */
  expiresAt?: string;
  /** Name of the therapist who sent the form */
  therapistName: string;
  /** Form responses (if completed) */
  responses?: Record<string, unknown>;
}

/**
 * Props for client form field component
 */
export interface ClientFormFieldProps {
  /** Field definition */
  field: ClientFormField;
  /** Current field value */
  value: unknown;
  /** Callback when field value changes */
  onChange: (fieldId: string, value: unknown) => void;
  /** Validation error message for this field */
  error?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
}

// =====================================
// Subscription and Plan Types
// =====================================

/**
 * User subscription plan information
 */
export interface SubscriptionPlan {
  /** Plan identifier */
  id: string;
  /** Plan display name */
  name: string;
  /** Plan price (if applicable) */
  price?: number;
  /** Whether this is a premium plan */
  isPremium: boolean;
  /** Plan features list */
  features: string[];
  /** Plan status */
  status: 'active' | 'inactive' | 'cancelled' | 'pending';
}

/**
 * Props for subscription plan indicator component
 */
export interface SubscriptionPlanIndicatorProps {
  /** Current subscription plan */
  plan?: SubscriptionPlan;
  /** Optional CSS class name */
  className?: string;
}
