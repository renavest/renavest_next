import { redirect } from 'next/navigation';

import { COLORS } from '@/src/styles/colors';

export interface BookingConfirmationScreenProps {
  formattedDateTime: string;
}

export const BookingConfirmationScreen = ({
  formattedDateTime,
}: BookingConfirmationScreenProps) => {
  const handleReturn = () => {
    redirect('/explore');
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen p-4 ${COLORS.WARM_PURPLE[5]}`}
    >
      <div
        className={`${COLORS.WARM_WHITE.bg} p-8 rounded-xl shadow-lg max-w-md w-full text-center`}
      >
        <h2 className={`text-2xl font-bold ${COLORS.WARM_PURPLE.DEFAULT} mb-4`}>
          Session Confirmed! 🎉
        </h2>

        <p className='text-gray-600 mb-6'>
          Your session has been scheduled for:
          <br />
          <span className='font-semibold'>{formattedDateTime}</span>
        </p>

        <p className='text-sm text-gray-500'>
          A confirmation email has been sent to your registered email address with all the details.
        </p>

        <button
          onClick={handleReturn}
          className={`w-full ${COLORS.WARM_PURPLE.bg} text-white py-3 rounded-lg ${COLORS.WARM_PURPLE.hover} transition-colors`}
        >
          Continue Exploring
        </button>
      </div>
    </div>
  );
};
