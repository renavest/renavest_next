'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { GoogleCalendarIntegration } from '@/src/features/google-calendar/components/GoogleCalendarIntegration';
import { StripeConnectIntegration } from '@/src/features/stripe/components/StripeConnectIntegration';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';

export default function IntegrationsPage() {
  const { user } = useUser();
  const [therapistId, setTherapistId] = useState<number | null>(null);

  // Get therapist ID from user metadata or API
  useEffect(() => {
    const getTherapistId = async () => {
      if (user?.publicMetadata?.therapistId) {
        setTherapistId(user.publicMetadata.therapistId as number);
      } else if (user?.id) {
        // Fallback to API call if not in metadata
        try {
          const response = await fetch('/api/therapist/profile');
          if (response.ok) {
            const data = await response.json();
            setTherapistId(data.therapist?.id || null);
          }
        } catch (error) {
          console.error('Error fetching therapist ID:', error);
        }
      }
    };

    getTherapistId();
  }, [user]);

  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar pageTitle='Integrations' showBackButton={true} backButtonHref='/therapist' />

      <div className='max-w-4xl mx-auto mt-10'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-3'>Integrations</h1>
          <p className='text-gray-600 text-lg'>
            Connect your essential tools to streamline your practice and get paid faster.
          </p>
        </div>

        <div className='space-y-8'>
          {/* Payment Integration */}
          <div>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>Payment & Banking</h2>
            {therapistId && <StripeConnectIntegration therapistId={therapistId} />}
          </div>

          {/* Calendar Integration */}
          <div>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>Calendar & Scheduling</h2>
            <GoogleCalendarIntegration />
          </div>

          {/* Future Integrations */}
          <div>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>Coming Soon</h2>
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>Additional Integrations</h3>
                  <p className='text-gray-500 text-sm'>
                    More tools to enhance your workflow are coming soon
                  </p>
                </div>
              </div>
              <div className='grid md:grid-cols-3 gap-4 text-gray-600 text-sm'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Zoom Integration</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Microsoft Teams</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Practice Management</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Email Marketing</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Document Storage</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Communication Tools</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
