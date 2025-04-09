import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useState } from 'react';

import { COLORS } from '@/src/styles/colors';

import { BookingConfirmationScreen } from './BookingConfirmationScreen';
import { DateInput } from './BookingFormComponents/DateInput';
import { TimeSelect } from './BookingFormComponents/TimeSelect';
import { TimezoneSelect } from './BookingFormComponents/TimezoneSelect';

interface BookingConfirmationProps {
  advisorId: string;
  onConfirm: (details: {
    date: string;
    startTime: string;
    timezone: string;
    therapistId: string;
  }) => void;
}

export const BookingConfirmation = ({ advisorId, onConfirm }: BookingConfirmationProps) => {
  const { user } = useUser();
  const [localDate, setLocalDate] = useState('');
  const [localStartTime, setLocalStartTime] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('EST');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dateError, setDateError] = useState('');

  const isValidDate = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  const handleConfirm = () => {
    if (!localDate || !localStartTime) return;

    if (!isValidDate(localDate)) {
      setDateError('Please select a future date');
      return;
    }

    // Remove AM/PM and convert to 24-hour format
    const convertTo24Hour = (time: string) => {
      const [timePart, modifier] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (modifier === 'PM' && hours !== 12) {
        hours += 12;
      }
      if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const formattedTime = convertTo24Hour(localStartTime);
    const sessionTimestamp = new Date(`${localDate}T${formattedTime}`).toISOString();

    onConfirm({
      date: sessionTimestamp,
      startTime: formattedTime,
      timezone: selectedTimezone,
      therapistId: advisorId,
    });

    posthog.capture('session_booked', {
      sessionDate: sessionTimestamp,
      sessionStartTime: formattedTime,
      timezone: selectedTimezone,
      therapistId: advisorId,
    });

    posthog.identify(user?.id, {
      $add_to_list: {
        sessions: {
          date: sessionTimestamp,
          startTime: formattedTime,
          timezone: selectedTimezone,
          therapistId: advisorId,
          timestamp: new Date().toISOString(),
        },
      },
    });

    setIsSubmitted(true);
  };

  const handleDateChange = (value: string) => {
    setLocalDate(value);
    if (value && !isValidDate(value)) {
      setDateError('Please select a future date');
    } else {
      setDateError('');
    }
  };

  if (isSubmitted) {
    return (
      <BookingConfirmationScreen
        date={localDate}
        startTime={localStartTime}
        timezone={selectedTimezone}
      />
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen p-4 ${COLORS.WARM_PURPLE[5]}`}
    >
      <div
        className={`${COLORS.WARM_WHITE.bg} p-8 rounded-xl shadow-lg max-w-md w-full text-center`}
      >
        <h2 className={`text-2xl font-bold ${COLORS.WARM_PURPLE.DEFAULT} mb-4`}>
          Your Healing Journey Continues Here 🌱
        </h2>

        <p className='text-gray-600 mb-4'>
          To ensure our records are accurate, please re-enter the session date and time you booked.
        </p>

        <div className='space-y-4'>
          <DateInput
            label='Re-enter Session Date'
            value={localDate}
            onChange={handleDateChange}
            error={dateError}
          />
          <TimeSelect
            label='Re-enter Start Time'
            value={localStartTime}
            onChange={setLocalStartTime}
          />
          <TimezoneSelect value={selectedTimezone} onChange={setSelectedTimezone} />

          <button
            onClick={handleConfirm}
            disabled={!localDate || !localStartTime}
            className={`w-full ${COLORS.WARM_PURPLE.bg} text-white py-3 rounded-lg ${COLORS.WARM_PURPLE.hover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Submit Session Details
          </button>
        </div>

        <p className='text-xs text-gray-500 mt-4'>
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
};
