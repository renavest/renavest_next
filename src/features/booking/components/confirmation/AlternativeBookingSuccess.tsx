'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { COLORS } from '@/src/styles/colors';

export function AlternativeBookingSuccess() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-green-50 py-16 flex items-center justify-center'>
      <div className='w-full max-w-2xl mx-auto px-4 sm:px-8'>
        <div className='bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100'>
          <div className='px-8 py-10 sm:p-12 flex flex-col items-center'>
            <div className='flex items-center justify-center mb-6'>
              <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                <Check className='h-10 w-10 text-green-600' />
              </div>
            </div>
            <h2 className='text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-4 tracking-tight'>
              Booking Received
            </h2>
            <p className='text-lg text-center text-gray-600 mb-8 max-w-md'>
              Your booking has been submitted. A therapist will be in touch with you shortly to
              confirm the details.
            </p>
            <div className='mt-10 flex justify-center w-full'>
              <button
                onClick={() => router.push('/employee')}
                className={`inline-flex items-center px-8 py-3 border-0 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 ${COLORS.WARM_PURPLE.bg} ${COLORS.WARM_WHITE.DEFAULT} ${COLORS.WARM_PURPLE.hover} ${COLORS.WARM_PURPLE.focus}`}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
