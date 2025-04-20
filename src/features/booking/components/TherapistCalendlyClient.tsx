'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';
import { InlineWidget, EventScheduledEvent } from 'react-calendly';
import { useCalendlyEventListener } from 'react-calendly';

import { createBookingSession } from '@/src/features/booking/actions/bookingActions';
import { BookingConfirmation } from '@/src/features/booking/components/BookingConfirmation/BookingConfirmation';
import { getInitials } from '@/src/features/booking/utils/stringUtils';

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
    timezone: string;
  }) => {
    if (!userId) {
      console.error('No user ID found');
      return {
        sessionId: -1,
        success: false,
        message: 'No user ID found',
        emailSent: false,
      };
    }

    try {
      // Use server action to create booking session
      const bookingResult = await createBookingSession({
        userId,
        therapistId: details.therapistId,
        sessionDate: details.date,
        sessionStartTime: `${details.date}T${details.startTime}`,
        userEmail,
        timezone: details.timezone || 'EST', // Default to EST if not provided
      });
      // Track booking confirmation
      await trackCalendlyEvent('booking_details_confirmed', details);

      console.log('Booking session saved successfully');
      return {
        sessionId: bookingResult?.sessionId || -1,
        success: true,
        message: 'Booking session saved successfully',
        emailSent: true, // or false if you want to be more accurate
      };
    } catch (error) {
      console.error('Error saving booking session:', error);
      // Show error to user
      return {
        sessionId: -1,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        emailSent: false,
      };
    }
  };

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      setIsBookingConfirmed(true);
      trackCalendlyEvent('calendly_event_scheduled', e);
    },
  });

  if (isBookingConfirmed) {
    return (
      <BookingConfirmation
        advisorId={advisor.id}
        onConfirm={handleBookingConfirmation}
        advisorInitials={getInitials(advisor.name)}
      />
    );
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
