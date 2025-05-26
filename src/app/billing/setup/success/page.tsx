'use client';

import { Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { COLORS } from '@/src/styles/colors';

export default function BillingSetupSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams?.get('redirect') || '/explore';
  const therapistId = searchParams?.get('therapistId');

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      if (therapistId) {
        router.push(`/book/${therapistId}`);
      } else {
        router.push(redirectTo);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, redirectTo, therapistId]);

  const handleContinue = () => {
    if (therapistId) {
      router.push(`/book/${therapistId}`);
    } else {
      router.push(redirectTo);
    }
  };

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
              Payment Method Added!
            </h2>

            <p className='text-lg text-center text-gray-600 mb-8 max-w-md'>
              Your payment method has been securely saved. You can now book therapy sessions
              directly through our platform.
            </p>

            <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 w-full max-w-md'>
              <div className='text-center'>
                <h3 className='text-sm font-medium text-blue-900 mb-1'>What's Next?</h3>
                <p className='text-sm text-blue-700'>
                  {therapistId
                    ? "You'll be redirected to complete your booking in a few seconds."
                    : 'You can now book sessions with any therapist instantly.'}
                </p>
              </div>
            </div>

            <div className='mt-6 flex justify-center w-full'>
              <button
                onClick={handleContinue}
                className={`inline-flex items-center px-8 py-3 border-0 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 ${COLORS.WARM_PURPLE.bg} ${COLORS.WARM_WHITE.DEFAULT} ${COLORS.WARM_PURPLE.hover} ${COLORS.WARM_PURPLE.focus}`}
              >
                {therapistId ? 'Continue Booking' : 'Explore Therapists'}
              </button>
            </div>

            <p className='text-sm text-gray-500 mt-4 text-center'>
              Redirecting automatically in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
