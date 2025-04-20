'use client';

import { useEffect, useState } from 'react';
import { InlineWidget } from 'react-calendly';
import { useCalendlyEventListener } from 'react-calendly';
import { BookingConfirmation } from '@/src/features/booking/components/BookingConfirmation/BookingConfirmation';
import { createBookingSession } from '@/src/features/booking/actions/bookingActions';
import { getInitials } from '@/src/features/booking/utils/stringUtils';

interface BookingFlowProps {
  advisor: {
    id: string;
    name: string;
    bookingURL: string;
    profileUrl?: string;
  };
  userId: string;
  userEmail: string;
}

export default function BookingFlow({ advisor, userId, userEmail }: BookingFlowProps) {
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState<null | boolean>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  // Check Google Calendar integration on mount
  useEffect(() => {
    async function checkIntegration() {
      try {
        const res = await fetch(`/api/google-calendar/status?therapistId=${advisor.id}`);
        const data = await res.json();
        setIsGoogleCalendarConnected(!!data.isConnected);
      } catch (err) {
        setIsGoogleCalendarConnected(false);
      }
    }
    checkIntegration();
  }, [advisor.id]);

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
      const result = await createBookingSession({
        userId,
        therapistId: details.therapistId,
        sessionDate: details.date,
        sessionStartTime: `${details.date}T${details.startTime}`,
        timezone: details.timezone,
        userEmail,
      });
      await trackCalendlyEvent('booking_details_confirmed', details);
      return result;
    } catch (error) {
      console.error('Error saving booking session:', error);
      throw error;
    }
  };

  // Calendly event listener
  useCalendlyEventListener({
    onEventScheduled: (e) => {
      setIsBookingConfirmed(true);
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

  // If Google Calendar is connected, show internal booking
  if (isGoogleCalendarConnected) {
    return (
      <BookingConfirmation
        advisorId={advisor.id}
        onConfirm={handleBookingConfirmation}
        advisorName={advisor.name}
        advisorImage={advisor.profileUrl}
        advisorInitials={getInitials(advisor.name)}
      />
    );
  }

  // If not connected, show Calendly widget and confirmation after booking
  if (isBookingConfirmed) {
    return (
      <BookingConfirmation
        advisorId={advisor.id}
        onConfirm={handleBookingConfirmation}
        advisorName={advisor.name}
        advisorImage={advisor.profileUrl}
        advisorInitials={getInitials(advisor.name)}
      />
    );
  }

  return (
    <InlineWidget
      url={advisor.bookingURL}
      styles={{ height: '100%', width: '100%', minHeight: '100vh' }}
    />
  );
}
