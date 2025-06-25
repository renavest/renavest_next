// src/features/booking/types.ts
// Booking feature type definitions

import { ReactNode } from 'react';

import type { TimeSlot } from '@/src/shared/types';

// ===== CORE TYPES =====

export interface BookingData {
  therapistId: number;
  date: string;
  time: string;
  notes?: string;
  clientName: string;
  clientEmail: string;
  sessionType: string;
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  conflictReason?: string;
}

// ===== COMPONENT PROP TYPES =====

// Calendar component props
export interface CalendarGridProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availableDates: Date[];
  minDate?: Date;
  maxDate?: Date;
}

// Booking flow props
export interface BookingFlowProps {
  advisorId: string;
  onBookingComplete?: (bookingId: string) => void;
  onCancel?: () => void;
}

// Alternative booking props
export interface AlternativeBookingProps {
  advisorId: string;
  advisorName: string;
  advisorProfileUrl?: string;
  onBackToScheduling?: () => void;
}

// Billing check wrapper props
export interface BillingCheckWrapperProps {
  children: ReactNode;
  advisorId?: string;
}

export interface TherapistAvailabilityProps {
  therapistId: number;
  onSlotSelect: (slot: TimeSlot) => void;
  onGoogleCalendarNotAvailable?: () => void;
}

// Time selection modal props
export interface TimeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableSlots: AvailabilitySlot[];
  selectedDate: Date;
  onTimeSelect: (time: string) => void;
  therapistName?: string;
}

// Booking form props
export interface BookingFormProps {
  therapistId: string;
  selectedDate: Date;
  selectedTime: string;
  onSubmit: (data: BookingData) => Promise<void>;
  onCancel: () => void;
}

// Booking confirmation props
export interface BookingConfirmationProps {
  bookingId: string;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  meetingLink?: string;
}

// Booking confirmation modal props
export interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    therapistName: string;
    date: string;
    time: string;
    meetingLink?: string;
  };
}

// Email template props
export interface BookingConfirmationEmailProps {
  clientName: string;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  meetingLink: string;
  cancellationLink?: string;
}

export interface TherapistBookingNotificationEmailProps {
  therapistName: string;
  clientName: string;
  sessionDate: string;
  sessionTime: string;
  clientEmail: string;
  notes?: string;
}

export interface TherapistCalendlyEmailProps {
  therapistName: string;
  clientName: string;
  clientEmail: string;
  preferredTimes?: string[];
  specialRequests?: string;
}
