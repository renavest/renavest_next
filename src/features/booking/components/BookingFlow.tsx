'use client';

import posthog from 'posthog-js';
import { useEffect, useState } from 'react';
import { useCalendlyEventListener } from 'react-calendly';

import AlternativeBooking from '@/src/features/booking/components/AlternativeBooking';
import { BookingForm } from '@/src/features/booking/components/form/BookingForm';
import { getInitials } from '@/src/features/booking/utils/stringUtils';
import { fetchGoogleCalendarStatus } from '@/src/features/google-calendar/utils/googleCalendarIntegration';
interface BookingFlowProps {
  advisor: {
    id: string;
    name: string;
    bookingURL: string;
    profileUrl?: string;
    email?: string;
  };
  userId: string;
  userEmail: string;
}

// Custom hook to check Google Calendar integration
function useGoogleCalendarIntegration(advisorId: string) {
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState<null | boolean>(null);
  useEffect(() => {
    async function checkIntegration() {
      try {
        const res = await fetchGoogleCalendarStatus(advisorId);
        setIsGoogleCalendarConnected(!!res.isConnected);
      } catch {
        setIsGoogleCalendarConnected(false);
      }
    }
    checkIntegration();
  });
  return isGoogleCalendarConnected;
}

export default function UnifiedBookingFlow({ advisor, userId, userEmail }: BookingFlowProps) {
  // Identify user in PostHog on mount
  useEffect(() => {
    if (userId && userEmail && typeof window !== 'undefined') {
      posthog.identify(userId, { email: userEmail });
    }
  }, [userId, userEmail]);

  const isGoogleCalendarConnected = useGoogleCalendarIntegration(advisor.id);
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
      // setIsBookingConfirmed(true);
      trackCalendlyEvent('calendly_event_scheduled', e);
    },
  });

  // Loading state
  if (isGoogleCalendarConnected === null) {
    return (
      <div className='flex items-center justify-center min-h-[300px]'>
        Loading booking options...
      </div>
    );
  }

  // If Google Calendar is not connected, show AlternativeBooking
  if (!isGoogleCalendarConnected) {
    return <AlternativeBooking advisor={advisor} bookingURL={advisor.bookingURL} />;
  }

  // If Google Calendar is connected, show internal booking
  return (
    <BookingForm
      advisorId={advisor.id}
      onConfirm={handleBookingConfirmation}
      advisorName={advisor.name}
      advisorImage={advisor.profileUrl}
      advisorInitials={getInitials(advisor.name)}
    />
  );
}
