'use client';

import { notFound } from 'next/navigation';
import posthog from 'posthog-js';
import { useState } from 'react';
import { InlineWidget } from 'react-calendly';
import { useCalendlyEventListener } from 'react-calendly';

import { advisorSignal } from '@/src/features/advisors/state/advisorSignals';
import { BookingConfirmation } from '@/src/features/booking/components/BookingConfirmation';
import { BookingDetails, CalendlyEventDetails } from '@/src/features/booking/utils/calendlyTypes';

function TherapistCalendly() {
  const advisor = advisorSignal.value;
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Redirect if no advisor is found
  if (!advisor?.id || !advisor?.bookingURL) {
    notFound();
  }

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      const calendlyEvent = e.data.payload.event as CalendlyEventDetails;
      if (calendlyEvent?.start_time && calendlyEvent?.end_time) {
        const startTime = new Date(calendlyEvent.start_time);
        const endTime = new Date(calendlyEvent.end_time);

        const newBookingDetails: BookingDetails = {
          date: startTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          startTime: startTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          endTime: endTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        setBookingDetails(newBookingDetails);
        posthog.capture('calendly_event_scheduled', {
          therapist_id: advisor.id,
          therapist_name: advisor.name,
          event_data: calendlyEvent,
        });
      }
    },
  });

  if (bookingDetails) {
    return (
      <BookingConfirmation
        bookingDetails={bookingDetails}
        onConfirm={() => {
          posthog.capture('booking_details_confirmed', {
            therapist_id: advisor.id,
            therapist_name: advisor.name,
          });
        }}
        onReschedule={() => setBookingDetails(null)}
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

export default TherapistCalendly;
