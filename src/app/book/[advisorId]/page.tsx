'use client';

import { redirect } from 'next/navigation';
import posthog from 'posthog-js';
import { useState } from 'react';
import { InlineWidget } from 'react-calendly';
import { useCalendlyEventListener } from 'react-calendly';

import { advisorSignal } from '@/src/features/advisors/state/advisorSignals';
import { BookingConfirmation } from '@/src/features/booking/components/BookingConfirmation';

function TherapistCalendly() {
  const advisor = advisorSignal.value;
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  // Redirect if no advisor is found
  if (!advisor?.id || !advisor?.bookingURL) {
    redirect('/explore');
  }

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      console.log('e', e);
      setIsBookingConfirmed(true);
      posthog.capture('calendly_event_scheduled', {
        therapist_id: advisor.id,
        therapist_name: advisor.name,
        event_data: e,
      });
    },
  });

  if (isBookingConfirmed) {
    return (
      <BookingConfirmation
        onConfirm={() => {
          posthog.capture('booking_details_confirmed', {
            therapist_id: advisor.id,
            therapist_name: advisor.name,
          });
        }}
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
