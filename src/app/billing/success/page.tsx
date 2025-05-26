'use client';

import { useUser } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BillingSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID found in URL');
      return;
    }

    if (!user) {
      setStatus('error');
      setMessage('User not authenticated');
      return;
    }

    // Trigger subscription status sync
    const syncSubscription = async () => {
      try {
        const response = await fetch('/api/stripe/sync-after-success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Payment successful! Your subscription is now active.');

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          const error = await response.json();
          setStatus('error');
          setMessage(error.message || 'Failed to process payment');
        }
      } catch (error) {
        console.error('Error syncing subscription:', error);
        setStatus('error');
        setMessage('An error occurred while processing your payment');
      }
    };

    syncSubscription();
  }, [searchParams, user, router]);

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          <div className='text-center'>
            {status === 'loading' && (
              <>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <h2 className='text-lg font-medium text-gray-900 mb-2'>
                  Processing your payment...
                </h2>
                <p className='text-sm text-gray-600'>
                  Please wait while we confirm your subscription.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4'>
                  <svg
                    className='h-6 w-6 text-green-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
                <h2 className='text-lg font-medium text-gray-900 mb-2'>Payment Successful!</h2>
                <p className='text-sm text-gray-600 mb-4'>{message}</p>
                <p className='text-xs text-gray-500'>Redirecting to your dashboard...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
                  <svg
                    className='h-6 w-6 text-red-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </div>
                <h2 className='text-lg font-medium text-gray-900 mb-2'>Payment Error</h2>
                <p className='text-sm text-gray-600 mb-4'>{message}</p>
                <button
                  onClick={() => router.push('/billing')}
                  className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  Back to Billing
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
