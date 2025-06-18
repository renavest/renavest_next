'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

import TherapistNavbar from '@/src/features/therapist-dashboard/components/navigation/TherapistNavbar';
import { SessionCompletionCard } from '@/src/features/therapist-dashboard/components/sessions/SessionCompletionCard';
import {
  sessionCompletionSignal,
  fetchCompletableSessions,
  fetchStripeConnectStatus,
  therapistPaymentSignal,
} from '@/src/features/therapist-dashboard/state/therapistDashboardState';

export default function SessionCompletePage() {
  const { user } = useUser();
  const sessionState = sessionCompletionSignal.value;
  const paymentState = therapistPaymentSignal.value;

  useEffect(() => {
    if (user) {
      // Fetch both completable sessions and payment status
      fetchCompletableSessions();
      fetchStripeConnectStatus();
    }
  }, [user]);

  if (sessionState.loading) {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
        <TherapistNavbar
          pageTitle='Session Completion'
          showBackButton={true}
          backButtonHref='/therapist/dashboard'
        />
        <div className='max-w-4xl mx-auto mt-10'>
          <div className='text-center'>
            <div className='text-lg text-gray-600'>Loading sessions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (sessionState.error) {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
        <TherapistNavbar
          pageTitle='Session Completion'
          showBackButton={true}
          backButtonHref='/therapist/dashboard'
        />
        <div className='max-w-4xl mx-auto mt-10'>
          <div className='text-center'>
            <div className='text-lg text-red-600'>Error: {sessionState.error}</div>
            <button
              onClick={() => fetchCompletableSessions()}
              className='mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const needsBankSetup = !paymentState.paymentSettings.bankAccountConnected;
  const hasPaymentSessions = sessionState.sessions.some((session) => session.paymentRequired);

  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar
        pageTitle='Session Completion'
        showBackButton={true}
        backButtonHref='/therapist/dashboard'
      />

      <div className='max-w-4xl mx-auto mt-10'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Session Completion</h1>
          <p className='text-gray-600'>
            Mark your completed sessions to process payments and close out sessions.
          </p>
        </div>

        {/* Bank Account Setup Warning */}
        {needsBankSetup && hasPaymentSessions && (
          <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center'>
                <span className='text-white text-xs font-bold'>!</span>
              </div>
              <span className='font-medium text-amber-800'>Bank Account Setup Required</span>
            </div>
            <p className='text-amber-700 text-sm mb-3'>
              You have paid sessions ready to complete, but your bank account isn't connected yet.
              Complete your bank setup to receive payments.
            </p>
            <a
              href='/therapist/integrations?tab=stripe'
              className='inline-flex items-center px-3 py-1 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 transition-colors'
            >
              Set Up Bank Account
            </a>
          </div>
        )}

        {sessionState.sessions.length === 0 ? (
          <div className='text-center py-12'>
            <div className='text-xl text-gray-500 mb-4'>No sessions to complete</div>
            <p className='text-gray-400'>
              Completed sessions will appear here for you to confirm and process payment.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {sessionState.sessions.map((session) => (
              <SessionCompletionCard key={session.id} session={session} />
            ))}
          </div>
        )}

        <div className='mt-12 bg-gray-50 rounded-lg p-6'>
          <h2 className='text-lg font-semibold mb-4'>How Session Completion Works</h2>
          <div className='space-y-3 text-sm text-gray-600'>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium text-xs'>
                1
              </div>
              <div>Sessions automatically appear here after their scheduled end time</div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium text-xs'>
                2
              </div>
              <div>Click "Confirm Session Completed" to process payment (if applicable)</div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium text-xs'>
                3
              </div>
              <div>Your earnings will be transferred within 2-3 business days</div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium text-xs'>
                4
              </div>
              <div>Sessions auto-complete after 24 hours if not manually confirmed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
