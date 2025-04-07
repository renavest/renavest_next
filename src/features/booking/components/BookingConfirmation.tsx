import { useState } from 'react';

import { COLORS } from '@/src/styles/colors';

import { BookingDetails } from '../utils/calendlyTypes';

interface BookingConfirmationProps {
  bookingDetails: BookingDetails | null;
  onConfirm: (confirmedDetails: BookingDetails) => void;
  _onReschedule?: () => void; // Prefixed with underscore to satisfy linter
}

export const BookingConfirmation = ({
  bookingDetails,
  onConfirm,
  _onReschedule,
}: BookingConfirmationProps) => {
  const [localDate, setLocalDate] = useState(bookingDetails?.date || '');
  const [localStartTime, setLocalStartTime] = useState(bookingDetails?.startTime || '');
  const [localEndTime, setLocalEndTime] = useState(bookingDetails?.endTime || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleConfirm = () => {
    if (localDate && localStartTime && localEndTime) {
      onConfirm({
        date: localDate,
        startTime: localStartTime,
        endTime: localEndTime,
      });
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
  ) => (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 rounded-lg border ${COLORS.WARM_PURPLE[20]} ${COLORS.WARM_PURPLE.focus} outline-none`}
        placeholder={placeholder}
      />
    </div>
  );

  const renderInitialConfirmation = () => (
    <>
      {bookingDetails && (
        <div className='space-y-4 mb-6'>
          <p className='text-gray-700'>
            <span className='font-semibold'>Date:</span> {bookingDetails.date}
          </p>
          <p className='text-gray-700'>
            <span className='font-semibold'>Time:</span> {bookingDetails.startTime} -{' '}
            {bookingDetails.endTime}
          </p>
        </div>
      )}

      <div className='space-y-4'>
        <button
          onClick={() => setIsEditing(true)}
          className={`w-full ${COLORS.WARM_PURPLE.DEFAULT} border ${COLORS.WARM_PURPLE.border} py-3 rounded-lg ${COLORS.WARM_PURPLE.hoverBorder} transition-colors`}
        >
          Verify Session Details
        </button>
        <button
          onClick={() => onConfirm(bookingDetails!)}
          className={`w-full ${COLORS.WARM_PURPLE.bg} text-white py-3 rounded-lg ${COLORS.WARM_PURPLE.hover} transition-colors`}
        >
          Confirm Details
        </button>
      </div>
    </>
  );

  const renderDetailVerification = () => (
    <div className='space-y-4'>
      <p className='text-gray-600 mb-4'>
        To help us ensure accuracy, please verify and confirm your session details:
      </p>

      {renderInput('Session Date', localDate, setLocalDate, 'e.g., Monday, July 15, 2024')}

      <div className='flex space-x-4'>
        <div className='flex-1'>
          {renderInput('Start Time', localStartTime, setLocalStartTime, 'e.g., 02:00 PM')}
        </div>
        <div className='flex-1'>
          {renderInput('End Time', localEndTime, setLocalEndTime, 'e.g., 03:00 PM')}
        </div>
      </div>

      <div className='space-y-3 mt-4'>
        <button
          onClick={handleConfirm}
          disabled={!localDate || !localStartTime || !localEndTime}
          className={`w-full ${COLORS.WARM_PURPLE.bg} text-white py-3 rounded-lg ${COLORS.WARM_PURPLE.hover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Confirm Session Details
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className={`w-full ${COLORS.WARM_PURPLE.DEFAULT} border ${COLORS.WARM_PURPLE.border} py-3 rounded-lg ${COLORS.WARM_PURPLE.hoverBorder} transition-colors`}
        >
          Back to Confirmation
        </button>
      </div>
    </div>
  );

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

        {!isEditing ? renderInitialConfirmation() : renderDetailVerification()}

        <p className='text-xs text-gray-500 mt-4'>
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
};
