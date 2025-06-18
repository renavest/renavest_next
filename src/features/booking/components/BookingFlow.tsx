'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';
import { useCalendlyEventListener } from 'react-calendly';

import AlternativeBooking from '@/src/features/booking/components/AlternativeBooking';
import BillingCheckWrapper from '@/src/features/booking/components/BillingCheckWrapper';
import { BookingForm } from '@/src/features/booking/components/form/BookingForm';
import { getInitials } from '@/src/features/booking/utils/stringUtils';

interface BookingFlowProps {
  advisor: {
    id: string;
    name: string;
    bookingURL: string;
    profileUrl?: string;
    email?: string;
    isPending?: boolean;
    hourlyRateCents?: number;
  };
  userId: string;
  userEmail: string;
}

export default function UnifiedBookingFlow({ advisor, userId, userEmail }: BookingFlowProps) {
  // Identify user in PostHog on mount
  useEffect(() => {
    if (userId && userEmail && typeof window !== 'undefined') {
      posthog.identify(userId, { email: userEmail });
    }
  }, [userId, userEmail]);

  // Track Calendly events
  const trackCalendlyEvent = async (eventType: string, eventData?: Record<string, unknown>) => {
    try {
      await fetch('/api/track/calendly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          therapistId: advisor.id,
          therapistName: advisor.name,
          eventData,
        }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  // Internal booking confirmation handler
  const handleBookingConfirmation = async (details: {
    date: string;
    startTime: string;
    therapistId: string;
    timezone: string;
  }) => {
    if (!userId) throw new Error('No user ID found');
    try {
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId: parseInt(details.therapistId),
          sessionDate: details.date,
          sessionTime: details.startTime,
          clientTimezone: details.timezone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      await trackCalendlyEvent('booking_details_confirmed', details);

      return {
        sessionId: result.booking.id,
        success: result.success,
        message: 'Booking created successfully',
        emailSent: true,
      };
    } catch (error) {
      console.error('Error saving booking session:', error);
      throw error;
    }
  };

  // Calendly event listener
  useCalendlyEventListener({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEventScheduled: (e: any) => {
      trackCalendlyEvent('calendly_event_scheduled', e);
    },
  });

  // Check if this is a pending therapist or if they don't have Google Calendar integration
  const shouldUseExternalBooking = advisor.isPending || !advisor.bookingURL;

  // If pending therapist or no Google Calendar integration, show AlternativeBooking
  if (shouldUseExternalBooking) {
    return <AlternativeBooking advisor={advisor} bookingURL={advisor.bookingURL} />;
  }

  // Check if we should enable billing checks - always check if therapist has pricing
  const hasPricing = advisor.hourlyRateCents && advisor.hourlyRateCents > 0;
  const shouldCheckBilling = hasPricing; // Always check billing if therapist has pricing

  // If active therapist with Google Calendar integration, show internal booking
  const bookingForm = (
    <BookingForm
      advisorId={advisor.id}
      onConfirm={handleBookingConfirmation}
      advisorName={advisor.name}
      advisorImage={advisor.profileUrl}
      advisorInitials={getInitials(advisor.name)}
      bookingURL={advisor.bookingURL}
      advisorEmail={advisor.email}
      advisorPricing={advisor.hourlyRateCents}
    />
  );

  // Conditionally wrap with billing check if therapist has pricing
  if (shouldCheckBilling) {
    return (
      <BillingCheckWrapper advisorId={advisor.id} shouldCheckBilling={true}>
        {bookingForm}
      </BillingCheckWrapper>
    );
  }

  return bookingForm;
}
