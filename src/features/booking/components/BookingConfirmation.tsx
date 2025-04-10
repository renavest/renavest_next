import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useState } from 'react';

import { COLORS } from '@/src/styles/colors';

import {
  TimezoneIdentifier,
  TimezoneOption,
  SUPPORTED_TIMEZONES,
  isValidFutureDate,
  createTimestamp,
  formatDateTime,
} from '../utils/dateTimeUtils';

import { BookingConfirmationScreen } from './BookingConfirmed';
import { DateInput } from './BookingFormComponents/DateInput';
import { TimeSelect } from './BookingFormComponents/TimeSelect';
import { TimezoneSelect } from './BookingFormComponents/TimezoneSelect';

interface BookingDetails {
  timestamp: Date;
  timezone: TimezoneIdentifier;
  therapistId: string;
}

interface BookingConfirmationProps {
  advisorId: string;
  onConfirm: (details: BookingDetails) => Promise<void>;
}

interface BookingFormProps {
  localDate: string;
  localStartTime: string;
  selectedTimezone: TimezoneIdentifier;
  dateError: string;
  isLoading: boolean;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onTimezoneChange: (value: TimezoneIdentifier) => void;
  onSubmit: () => void;
}

const LoadingSpinner = () => (
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
);

const BookingForm = ({
  localDate,
  localStartTime,
  selectedTimezone,
  dateError,
  isLoading,
  onDateChange,
  onTimeChange,
  onTimezoneChange,
  onSubmit,
}: BookingFormProps) => (
  <div
    className={`fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen p-4 ${COLORS.WARM_PURPLE[5]}`}
  >
    <div className={`${COLORS.WARM_WHITE.bg} p-8 rounded-xl shadow-lg max-w-md w-full text-center`}>
      <h2 className={`text-2xl font-bold ${COLORS.WARM_PURPLE.DEFAULT} mb-4`}>
        Your Healing Journey Continues Here 🌱
      </h2>

      <p className='text-gray-600 mb-4'>Please select your preferred session date and time.</p>

      <div className='space-y-4'>
        <DateInput
          label='Session Date'
          value={localDate}
          onChange={onDateChange}
          error={dateError}
        />
        <TimeSelect label='Session Time' value={localStartTime} onChange={onTimeChange} />
        <TimezoneSelect
          value={selectedTimezone}
          onChange={onTimezoneChange}
          options={Object.entries(SUPPORTED_TIMEZONES).map(
            ([id, label]): TimezoneOption => ({
              value: id as TimezoneIdentifier,
              label: `${label} (${id})`,
            }),
          )}
        />

        <button
          onClick={onSubmit}
          disabled={!localDate || !localStartTime || isLoading}
          className={`w-full ${COLORS.WARM_PURPLE.bg} text-white py-3 rounded-lg ${COLORS.WARM_PURPLE.hover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? <LoadingSpinner /> : 'Submit Session Details'}
        </button>
      </div>

      <p className='text-xs text-gray-500 mt-4'>
        A confirmation email will be sent to your registered email address.
      </p>
    </div>
  </div>
);

export const BookingConfirmation = ({ advisorId, onConfirm }: BookingConfirmationProps) => {
  const { user } = useUser();
  const [localDate, setLocalDate] = useState('');
  const [localStartTime, setLocalStartTime] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState<TimezoneIdentifier>('America/New_York');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dateError, setDateError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (value: string) => {
    setLocalDate(value);
    if (value && !isValidFutureDate(value)) {
      setDateError('Please select a future date');
    } else {
      setDateError('');
    }
  };

  const handleConfirm = async () => {
    if (!localDate || !localStartTime) return;

    if (!isValidFutureDate(localDate)) {
      setDateError('Please select a future date');
      return;
    }

    try {
      setIsLoading(true);

      // Create a timestamp in the user's selected timezone
      const timestamp = createTimestamp(localDate, localStartTime, selectedTimezone);

      await onConfirm({
        timestamp,
        timezone: selectedTimezone,
        therapistId: advisorId,
      });

      // Track the event in PostHog
      const sessionData = {
        timestamp: timestamp.toISOString(),
        timezone: selectedTimezone,
        therapistId: advisorId,
        formattedDateTime: formatDateTime(timestamp, selectedTimezone),
      };

      posthog.capture('session_booked', sessionData);

      posthog.identify(user?.id, {
        $add_to_list: {
          sessions: sessionData,
        },
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Booking confirmation error:', error);
      // Add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <BookingConfirmationScreen
        formattedDateTime={formatDateTime(
          createTimestamp(localDate, localStartTime, selectedTimezone),
          selectedTimezone,
        )}
      />
    );
  }

  return (
    <BookingForm
      localDate={localDate}
      localStartTime={localStartTime}
      selectedTimezone={selectedTimezone}
      dateError={dateError}
      isLoading={isLoading}
      onDateChange={handleDateChange}
      onTimeChange={setLocalStartTime}
      onTimezoneChange={setSelectedTimezone}
      onSubmit={handleConfirm}
    />
  );
};
