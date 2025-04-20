'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';
import { InlineWidget } from 'react-calendly';
import { useCalendlyEventListener } from 'react-calendly';

import { createBookingSession } from '@/src/features/booking/actions/bookingActions';
import { BookingConfirmation } from '@/src/features/booking/components/BookingConfirmation/BookingConfirmation';

interface TherapistCalendlyClientProps {
  advisor: {
    id: string;
    name: string;
    bookingURL: string;
    profileUrl?: string;
  };
  userId: string;
  userEmail: string;
}

export default function TherapistCalendlyClient({
  advisor,
  userId,
  userEmail,
}: TherapistCalendlyClientProps) {
  const [isUsingCalendly] = useState(false);

  // Redirect if no advisor is found
  if (!advisor?.id) {
    redirect('/explore');
  }

  const trackCalendlyEvent = async (eventType: string, eventData?: Record<string, unknown>) => {
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
          eventData,
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
    timezone: string;
  }) => {
    if (!userId) {
      throw new Error('No user ID found');
    }

    try {
      // Use server action to create booking session
      const result = await createBookingSession({
        userId,
        therapistId: details.therapistId,
        sessionDate: details.date,
        sessionStartTime: `${details.date}T${details.startTime}`,
        timezone: details.timezone,
        userEmail,
      });

      // Track booking confirmation
      await trackCalendlyEvent('booking_details_confirmed', details);

      console.log('Booking session saved successfully');
      return result;
    } catch (error) {
      console.error('Error saving booking session:', error);
      throw error;
    }
  };

  useCalendlyEventListener({
    onEventScheduled: () => {
      trackCalendlyEvent('calendly_event_scheduled');
    },
  });

  if (isUsingCalendly) {
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

  // Always render BookingConfirmation for the booking flow
  return (
    <BookingConfirmation
      advisorId={advisor.id}
      onConfirm={handleBookingConfirmation}
      advisorName={advisor.name}
      advisorImage={advisor.profileUrl}
    />
  );
}
