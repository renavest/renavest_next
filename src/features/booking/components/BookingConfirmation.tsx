import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useState } from 'react';

import { COLORS } from '@/src/styles/colors';

import { BookingConfirmationScreen } from './BookingConfirmed';
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
  const [isLoading, setIsLoading] = useState(false);

  const isValidDate = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  const handleConfirm = async () => {
    if (!localDate || !localStartTime) return;

    if (!isValidDate(localDate)) {
      setDateError('Please select a future date');
      return;
    }

    // Remove AM/PM and convert to 24-hour format
    const convertTo24Hour = (time: string) => {
      const [timePart, modifier] = time.split(' ');
      const [hours, minutes] = timePart.split(':').map(Number);

      let adjustedHours = hours;
      if (modifier === 'PM' && hours !== 12) {
        adjustedHours += 12;
      }
      if (modifier === 'AM' && hours === 12) {
        adjustedHours = 0;
      }

      return `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const formattedTime = convertTo24Hour(localStartTime);

    try {
      setIsLoading(true);

      // Confirm booking
      onConfirm({
        date: localDate,
        startTime: formattedTime,
        timezone: selectedTimezone,
        therapistId: advisorId,
      });

      // Track the event in PostHog
      posthog.capture('session_booked', {
        sessionDate: localDate,
        sessionStartTime: formattedTime,
        timezone: selectedTimezone,
        therapistId: advisorId,
      });

      posthog.identify(user?.id, {
        $add_to_list: {
          sessions: {
            date: localDate,
            startTime: formattedTime,
            timezone: selectedTimezone,
            therapistId: advisorId,
            timestamp: new Date().toISOString(),
          },
        },
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Booking confirmation error:', error);
      // Optionally, add error handling UI
    } finally {
      setIsLoading(false);
    }
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
            disabled={!localDate || !localStartTime || isLoading}
            className={`w-full ${COLORS.WARM_PURPLE.bg} text-white py-3 rounded-lg ${COLORS.WARM_PURPLE.hover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <svg
                  className='animate-spin h-5 w-5 mr-3'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit Session Details'
            )}
          </button>
        </div>

        <p className='text-xs text-gray-500 mt-4'>
          A confirmation email will be sent to your registered email address.
        </p>
      </div>
    </div>
  );
};
