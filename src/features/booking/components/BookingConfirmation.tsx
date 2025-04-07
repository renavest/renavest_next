import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useState } from 'react';

import { COLORS } from '@/src/styles/colors';

interface BookingConfirmationProps {
  onConfirm: (details: { date: string; startTime: string }) => void;
}

export const BookingConfirmation = ({ onConfirm }: BookingConfirmationProps) => {
  const { user } = useUser();
  const [localDate, setLocalDate] = useState('');
  const [localStartTime, setLocalStartTime] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleConfirm = () => {
    if (localDate && localStartTime) {
      onConfirm({
        date: localDate,
        startTime: localStartTime,
      });

      // Capture session booking event
      posthog.capture('session_booked', {
        sessionDate: localDate,
        sessionStartTime: localStartTime,
      });

      // Update user profile with cumulative session tracking
      posthog.identify(user?.id, {
        $set: {
          sessions: posthog.get_property('sessions')
            ? [
                ...posthog.get_property('sessions'),
                {
                  date: localDate,
                  startTime: localStartTime,
                  timestamp: new Date().toISOString(),
                },
              ]
            : [
                {
                  date: localDate,
                  startTime: localStartTime,
                  timestamp: new Date().toISOString(),
                },
              ],
        },
      });

      // Set submitted state
      setIsSubmitted(true);
    }
  };

  const renderDateInput = (label: string, value: string, onChange: (v: string) => void) => (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
      <input
        type='date'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 rounded-lg border ${COLORS.WARM_PURPLE[20]} ${COLORS.WARM_PURPLE.focus} outline-none`}
      />
    </div>
  );

  const renderTimeInput = (label: string, value: string, onChange: (v: string) => void) => (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
      <input
        type='time'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 rounded-lg border ${COLORS.WARM_PURPLE[20]} ${COLORS.WARM_PURPLE.focus} outline-none`}
      />
    </div>
  );

  // Confirmation screen component
  const ConfirmationScreen = () => (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen p-4 ${COLORS.WARM_PURPLE[5]}`}
    >
      <div
        className={`${COLORS.WARM_WHITE.bg} p-8 rounded-xl shadow-lg max-w-md w-full text-center`}
      >
        <h2 className={`text-3xl font-bold ${COLORS.WARM_PURPLE.DEFAULT} mb-4`}>
          Session Confirmed! ✅
        </h2>

        <div className='mb-6'>
          <p className='text-gray-700 text-lg mb-2'>Your session details:</p>
          <p className='font-semibold text-gray-800'>Date: {localDate}</p>
          <p className='font-semibold text-gray-800'>Start Time: {localStartTime}</p>
        </div>

        <div className='bg-green-50 border border-green-200 p-4 rounded-lg mb-6'>
          <p className='text-green-700'>
            🌟 A confirmation email has been sent to your registered email address.
          </p>
        </div>

        <button
          onClick={() => {
            // You might want to add a prop to handle closing or redirecting
            window.location.href = '/explore';
          }}
          className={`w-full ${COLORS.WARM_PURPLE.bg} text-white py-3 rounded-lg ${COLORS.WARM_PURPLE.hover} transition-colors`}
        >
          Return to Explore
        </button>
      </div>
    </div>
  );

  // Render confirmation screen if submitted
  if (isSubmitted) {
    return <ConfirmationScreen />;
  }

  // Original input screen
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen p-4 ${COLORS.WARM_PURPLE[5]}`}
    >
      <div
        className={`${COLORS.WARM_WHITE.bg} p-8 rounded-xl shadow-lg max-w-md w-full text-center`}
      >
        <h2 className={`text-2xl font-bold ${COLORS.WARM_PURPLE.DEFAULT} mb-4`}>
          Appointment Confirmed! 🎉
        </h2>

        <p className='text-gray-600 mb-4'>
          Your appointment has been confirmed! Now, for our records, could you kindly enter the
          session details?
        </p>

        <div className='space-y-4'>
          {renderDateInput('Session Date', localDate, setLocalDate)}

          {renderTimeInput('Start Time', localStartTime, setLocalStartTime)}

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
