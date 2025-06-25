export interface Advisor {
  id: string;
  name: string;
  title: string;
  bookingURL: string;
  expertise: string;
  certifications: string;
  song: string;
  yoe: string;
  clientele: string;
  longBio: string;
  previewBlurb: string;
  profileUrl?: string;
  introduction?: string;
  hourlyRate?: string;
  therapistId?: number;
  userId?: number;
  isPending?: boolean;
  hasGoogleCalendar?: boolean;
  googleCalendarStatus?: 'connected' | 'not_connected' | 'error';
  hasProfileImage?: boolean;
}

export type UserRole = 'employee' | 'therapist' | 'super_admin' | 'employer_admin' | null;

// ===== SHARED COMPONENT PROPS =====

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export interface SubscriptionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiresPremium?: boolean;
}

export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
}

export interface BillingSetupFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export interface PaymentMethodsSectionProps {
  className?: string;
  showTitle?: boolean;
}

// ===== PAGE-SPECIFIC INTERFACES =====

export interface ChatPreferences {
  allowDirectMessages: boolean;
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  availabilityHours: {
    start: string;
    end: string;
  };
}

export interface CompletableSession {
  id: string;
  clientName: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  sessionType: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  meetingLink?: string;
  clientEmail?: string;
}

export interface CalendarStatus {
  isConnected: boolean;
  email?: string;
  lastSync?: string;
  permissions?: string[];
  error?: string;
}

// ===== GOOGLE CALENDAR TYPES =====

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface WorkingHoursSectionProps {
  workingHours: WorkingHours[];
  onUpdate: (hours: WorkingHours[]) => void;
  loading?: boolean;
}

// ===== UTM AND TRACKING TYPES =====

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  company?: string;
}

export interface PageUtmHandlerProps {
  children: React.ReactNode;
  utmParams?: UtmParams;
}
