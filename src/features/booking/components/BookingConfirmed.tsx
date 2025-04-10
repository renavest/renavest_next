import { redirect } from 'next/navigation';

import { COLORS } from '@/src/styles/colors';

interface BookingConfirmationScreenProps {
  date: string;
  startTime: string;
  timezone: string;
}

export const BookingConfirmationScreen = ({
  date,
  startTime,
  timezone,
}: BookingConfirmationScreenProps) => {
  const handleReturn = () => {
    redirect('/explore');
  };

  // Format the date for better readability
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen p-4 ${COLORS.WARM_PURPLE[5]}`}
    >
      <div
        className={`${COLORS.WARM_WHITE.bg} p-8 rounded-xl shadow-lg max-w-md w-full text-center`}
      >
        <h2 className={`text-3xl font-bold ${COLORS.WARM_PURPLE.DEFAULT} mb-4`}>
          Your Session is Booked! 🌟
        </h2>

        <div className='mb-6 bg-purple-50 border border-purple-200 p-4 rounded-lg'>
          <h3 className='text-xl font-semibold text-gray-800 mb-3'>Session Details</h3>
          <p className='text-gray-700 mb-2'>
            <span className='font-medium'>Date:</span> {formattedDate}
          </p>
          <p className='text-gray-700'>
            <span className='font-medium'>Time:</span> {startTime} {timezone}
          </p>
        </div>

        <div className='bg-green-50 border border-green-200 p-4 rounded-lg mb-6'>
          <p className='text-green-700 font-medium'>
            📅 A calendar invite and confirmation email have been sent to your registered email.
          </p>
        </div>

        <div className='bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6'>
          <p className='text-blue-700'>
            💡 Tip: Have your questions and goals ready to make the most of your session!
          </p>
        </div>

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
