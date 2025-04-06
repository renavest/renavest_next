import posthog from 'posthog-js';
import { useState } from 'react';

import { BookingDetails } from '../utils/calendlyTypes';

interface UseManualBookingProps {
  advisorId?: string;
  advisorName?: string;
  onBookingComplete: (details: BookingDetails) => void;
}

export const useManualBooking = ({
  advisorId,
  advisorName,
  onBookingComplete,
}: UseManualBookingProps) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

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

    onBookingComplete(manualBookingDetails);

    posthog.capture('therapist_session_booked', {
      therapist_id: advisorId,
      therapist_name: advisorName,
      booking_method: 'manual',
    });
  };

  return {
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    handleManualBooking,
  };
};
