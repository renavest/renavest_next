import { COLORS } from '@/src/styles/colors';

import { BookingDetails } from '../utils/calendlyTypes';

interface BookingConfirmationProps {
  bookingDetails: BookingDetails | null;
  onConfirm: () => void;
  onReschedule: () => void;
}

export const BookingConfirmation = ({
  bookingDetails,
  onConfirm,
  onReschedule,
}: BookingConfirmationProps) => {
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
            onClick={onConfirm}
            className={`w-full ${COLORS.WARM_PURPLE.bg} text-white py-3 rounded-lg ${COLORS.WARM_PURPLE.hover} transition-colors`}
          >
            Confirm Details
          </button>
          <button
            onClick={onReschedule}
            className={`w-full ${COLORS.WARM_PURPLE.DEFAULT} border ${COLORS.WARM_PURPLE.border} py-3 rounded-lg ${COLORS.WARM_PURPLE.hoverBorder} transition-colors`}
          >
            Reschedule
          </button>
        </div>

        <p className='text-xs text-gray-500 mt-4'>
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
};
