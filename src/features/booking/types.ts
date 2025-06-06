// Booking Feature Types

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
  isBooked?: boolean;
  isBlocked?: boolean;
  clientName?: string;
}

export interface BookingDetails {
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  meetingLink?: string;
  therapistEmail?: string;
}

export interface BookingConfirmationProps {
  booking: BookingDetails;
  onClose: () => void;
}

export interface TherapistAvailabilityProps {
  therapistId: string;
  selectedDate?: Date;
  onTimeSlotSelect: (slot: TimeSlot) => void;
}

export interface BookingFlowProps {
  therapistId: string;
  onBookingComplete: (details: BookingDetails) => void;
}

export interface AlternativeBookingProps {
  therapistId: string;
  therapistName: string;
  therapistTitle: string;
  profileUrl: string;
  previewBlurb: string;
  bookingURL?: string;
}

export interface BillingCheckWrapperProps {
  children: React.ReactNode;
  requiresBilling?: boolean;
}

export interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: BookingDetails;
}

export interface CalendarGridProps {
  availableSlots: TimeSlot[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onTimeSlotSelect: (slot: TimeSlot) => void;
}

// Email template props
export interface BookingConfirmationEmailProps {
  customerName: string;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  meetingLink?: string;
  therapistEmail: string;
  customerEmail: string;
  bookingId: string;
  timezone: string;
  rescheduleLink?: string;
  cancelLink?: string;
}

export interface TherapistBookingNotificationEmailProps {
  therapistName: string;
  customerName: string;
  customerEmail: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  meetingLink?: string;
  bookingId: string;
  timezone: string;
  customerPhone?: string;
  notes?: string;
}

export interface TherapistCalendlyEmailProps {
  therapistName: string;
  customerName: string;
  customerEmail: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  bookingId: string;
  timezone: string;
  customerPhone?: string;
  notes?: string;
  calendlyEventId?: string;
}

// Page props
export interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
} 