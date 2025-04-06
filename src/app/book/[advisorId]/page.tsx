'use client';

import { useUser } from '@clerk/nextjs';
import dotenv from 'dotenv';
import posthog from 'posthog-js';
import { useState } from 'react';
import { InlineWidget } from 'react-calendly';

import { advisorSignal } from '@/src/features/advisors/state/advisorSignals';
import { BookingConfirmation } from '@/src/features/booking/components/BookingConfirmation';
import { ManualBooking } from '@/src/features/booking/components/ManualBooking';
import { useCalendlyEvents } from '@/src/features/booking/hooks/useCalendlyEvents';
import { useManualBooking } from '@/src/features/booking/hooks/useManualBooking';
import { BookingDetails } from '@/src/features/booking/utils/calendlyTypes';
import { COLORS } from '@/src/styles/colors';

if (process.env.NODE_ENV === 'development') {
  // Production environment
  // Do not load dotenv in production
  dotenv.config({ path: '.env.local' });
}

const TherapistCalendly = () => {
  const [isCalendlyBooked, setIsCalendlyBooked] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  const advisor = advisorSignal.value;
  const { user } = useUser();

  const handleBookingComplete = (details: BookingDetails) => {
    setBookingDetails(details);
    setIsBooked(true);
  };

  const { selectedDate, selectedTime, setSelectedDate, setSelectedTime, handleManualBooking } =
    useManualBooking({
      advisorId: advisor?.id,
      advisorName: advisor?.name,
      onBookingComplete: handleBookingComplete,
    });

  useCalendlyEvents({
    advisorId: advisor?.id,
    advisorName: advisor?.name,
    onEventScheduled: () => {
      setIsCalendlyBooked(true);
    },
  });

  const handleConfirmation = () => {
    posthog.capture('booking_details_confirmed', {
      therapist_id: advisor?.id,
      therapist_name: advisor?.name,
    });
  };

  // If no advisor or booking URL, show a fallback
  if (!advisor?.bookingURL) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p>No booking URL available for this advisor.</p>
      </div>
    );
  }

  if (isBooked) {
    return (
      <BookingConfirmation
        bookingDetails={bookingDetails}
        onConfirm={handleConfirmation}
        onReschedule={() => {
          setIsBooked(false);
          setIsCalendlyBooked(false);
        }}
      />
    );
  }

  if (isCalendlyBooked) {
    return (
      <ManualBooking
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateChange={setSelectedDate}
        onTimeChange={setSelectedTime}
        onBook={handleManualBooking}
        onCancel={() => setIsCalendlyBooked(false)}
      />
    );
  }

  return (
    <div className='fixed inset-0 z-50 bg-white'>
      <div className='absolute top-4 left-4 right-4 z-10 flex justify-between items-center'>
        <h1 className={`text-xl font-semibold ${COLORS.WARM_PURPLE.DEFAULT}`}>
          Book a Session with {advisor?.name}
        </h1>
      </div>
      <InlineWidget
        url={'https://calendly.com/seth-renavestapp'}
        styles={{
          height: '100%',
          width: '100%',
          minHeight: '100vh',
        }}
        prefill={{
          email: user?.emailAddresses[0]?.emailAddress || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
        }}
        pageSettings={{
          backgroundColor: 'ffffff',
          primaryColor: '9071FF', // Using WARM_PURPLE color
          textColor: '4d5055',
        }}
      />
    </div>
  );
};

export default TherapistCalendly;
