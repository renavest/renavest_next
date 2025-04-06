'use client';

import dotenv from 'dotenv';
import posthog from 'posthog-js';
import { useState } from 'react';

import { advisorSignal } from '@/src/features/advisors/state/advisorSignals';
import { BookingConfirmation } from '@/src/features/booking/components/BookingConfirmation';
import { CalendlyBooking } from '@/src/features/booking/components/CalendlyBooking';
import { ManualBooking } from '@/src/features/booking/components/ManualBooking';
import { BookingDetails } from '@/src/features/booking/utils/calendlyTypes';

if (process.env.NODE_ENV === 'development') {
  // Production environment
  // Do not load dotenv in production
  dotenv.config({ path: '.env.local' });
}

const TherapistCalendly = () => {
  const [isCalendlyBooked, setIsCalendlyBooked] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  const advisor = advisorSignal.value;

  const handleManualBooking = () => {
    if (!selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':');
    const startDate = new Date(selectedDate);
    startDate.setHours(parseInt(hours), parseInt(minutes));

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1); // Assuming 1-hour sessions

    const manualBookingDetails: BookingDetails = {
      date: startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      startTime: startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      endTime: endDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setBookingDetails(manualBookingDetails);
    setIsBooked(true);

    posthog.capture('booking_details_confirmed', {
      therapist_id: advisor?.id,
      therapist_name: advisor?.name,
      booking_method: 'manual',
    });
  };

  if (!advisor?.bookingURL) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p>No booking URL available for this advisor.</p>
      </div>
    );
  }

  if (isBooked && bookingDetails) {
    return (
      <BookingConfirmation
        bookingDetails={bookingDetails}
        onConfirm={() => {
          posthog.capture('booking_details_confirmed', {
            therapist_id: advisor?.id,
            therapist_name: advisor?.name,
          });
        }}
        onReschedule={() => {
          setIsBooked(false);
          setIsCalendlyBooked(false);
          setSelectedDate('');
          setSelectedTime('');
          setBookingDetails(null);
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
        onCancel={() => {
          setIsCalendlyBooked(false);
          setSelectedDate('');
          setSelectedTime('');
        }}
      />
    );
  }

  return (
    <CalendlyBooking
      advisorId={advisor.id}
      advisorName={advisor.name}
      advisorUrl={'https://calendly.com/seth-renavestapp'}
      onEventScheduled={() => setIsCalendlyBooked(true)}
    />
  );
};

export default TherapistCalendly;
