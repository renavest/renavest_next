import { redirect } from 'next/navigation';

import { COLORS } from '@/src/styles/colors';

interface BookingConfirmationScreenProps {
  date: string;
  startTime: string;
}

export const BookingConfirmationScreen = ({ date, startTime }: BookingConfirmationScreenProps) => {
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
        <h2 className={`text-3xl font-bold ${COLORS.WARM_PURPLE.DEFAULT} mb-4`}>
          Session Confirmed! ✅
        </h2>

        <div className='mb-6'>
          <p className='text-gray-700 text-lg mb-2'>Your session details:</p>
          <p className='font-semibold text-gray-800'>Date: {date}</p>
          <p className='font-semibold text-gray-800'>Start Time: {startTime}</p>
        </div>

        <div className='bg-green-50 border border-green-200 p-4 rounded-lg mb-6'>
          <p className='text-green-700'>
            🌟 A confirmation email has been sent to your registered email address.
          </p>
        </div>

        <button
          onClick={handleReturn}
          className={`w-full ${COLORS.WARM_PURPLE.bg} text-white py-3 rounded-lg ${COLORS.WARM_PURPLE.hover} transition-colors`}
        >
          Return to Explore
        </button>
      </div>
    </div>
  );
};
