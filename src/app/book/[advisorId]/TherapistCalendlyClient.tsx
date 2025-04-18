'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';
import { InlineWidget } from 'react-calendly';
import { useCalendlyEventListener } from 'react-calendly';

import { createBookingSession } from '@/src/features/booking/actions/bookingActions';
import { BookingConfirmation } from '@/src/features/booking/components/BookingConfirmation';
import { TherapistAvailability } from '@/src/features/booking/components/TherapistAvailability';

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
  const [isUsingCalendly, setIsUsingCalendly] = useState(false);

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
        timezone: details.timezone,
        userEmail,
      });

      // Track booking confirmation
      await trackCalendlyEvent('booking_details_confirmed', details);

      console.log('Booking session saved successfully');
    } catch (error) {
      console.error('Error saving booking session:', error);
      throw error;
    }
  };

  useCalendlyEventListener({
    onEventScheduled: () => {
      setIsBookingConfirmed(true);
      trackCalendlyEvent('calendly_event_scheduled');
    },
  });

  if (isBookingConfirmed) {
    return <BookingConfirmation advisorId={advisor.id} onConfirm={handleBookingConfirmation} />;
  }

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

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
          Book a Session with {advisor.name}
        </h2>
        <p className='text-gray-600'>Select an available time slot that works best for you.</p>
      </div>

      <TherapistAvailability
        therapistId={parseInt(advisor.id)}
        onSlotSelect={() => setIsBookingConfirmed(true)}
        onGoogleCalendarNotAvailable={() => {
          if (advisor.bookingURL) {
            setIsUsingCalendly(true);
          }
        }}
      />
    </div>
  );
}
