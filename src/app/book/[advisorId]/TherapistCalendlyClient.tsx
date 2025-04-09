'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';
import { InlineWidget, EventScheduledEvent } from 'react-calendly';
import { useCalendlyEventListener } from 'react-calendly';

import { createBookingSession } from '@/src/features/booking/actions/bookingActions';
import { BookingConfirmation } from '@/src/features/booking/components/BookingConfirmation';

interface TherapistCalendlyClientProps {
  advisor: {
    id: string;
    name: string;
    bookingURL: string;
  };
  userId: string;
  userEmail: string;
}

export default function TherapistCalendlyClient({
  advisor,
  userId,
  userEmail,
}: TherapistCalendlyClientProps) {
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  // Redirect if no advisor is found
  if (!advisor?.id || !advisor?.bookingURL) {
    redirect('/explore');
  }

  const trackCalendlyEvent = async (
    eventType: string,
    eventData?: EventScheduledEvent | Record<string, unknown>,
  ) => {
    try {
      await fetch('/api/track/calendly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          therapistId: advisor.id,
          therapistName: advisor.name,
          eventData: eventData ? JSON.parse(JSON.stringify(eventData)) : undefined,
        }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  const handleBookingConfirmation = async (details: {
    date: string;
    startTime: string;
    therapistId: string;
  }) => {
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    try {
      // Use server action to create booking session
      await createBookingSession({
        userId,
        therapistId: details.therapistId,
        sessionDate: details.date,
        sessionStartTime: `${details.date}T${details.startTime}`,
        userEmail,
      });

      // Track booking confirmation
      await trackCalendlyEvent('booking_details_confirmed', details);

      console.log('Booking session saved successfully');
    } catch (error) {
      console.error('Error saving booking session:', error);
    }
  };

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      setIsBookingConfirmed(true);
      trackCalendlyEvent('calendly_event_scheduled', e);
    },
  });

  if (isBookingConfirmed) {
    return <BookingConfirmation advisorId={advisor.id} onConfirm={handleBookingConfirmation} />;
  }

  return (
    <InlineWidget
      url={advisor.bookingURL}
      styles={{
        height: '100%',
        width: '100%',
        minHeight: '100vh',
      }}
    />
  );
}
