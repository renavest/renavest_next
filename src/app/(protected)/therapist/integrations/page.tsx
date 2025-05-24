'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { GoogleCalendarIntegration } from '@/src/features/google-calendar/components/GoogleCalendarIntegration';
import {
  useGoogleCalendarIntegration,
  fetchTherapistId,
} from '@/src/features/google-calendar/utils/googleCalendarIntegration';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';
import { WorkingHoursManager } from '@/src/features/therapist-dashboard/components/WorkingHoursManager';

export default function IntegrationsPage() {
  const { user } = useUser();
  const [therapistId, setTherapistId] = useState<string | null>(null);

  // Get integration status and actions from our unified hook
  const {
    status: { isConnected },
  } = useGoogleCalendarIntegration(therapistId || '');

  // Get therapist ID on mount
  useEffect(() => {
    async function getTherapistId() {
      if (user?.id) {
        // Try to get from metadata first
        const id = user.publicMetadata?.therapistId || (await fetchTherapistId(user.id));
        setTherapistId(id ? String(id) : null);
      }
    }

    getTherapistId();
  }, [user]);

  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar pageTitle='Integrations' showBackButton={true} backButtonHref='/therapist' />
      <div className='max-w-4xl mx-auto mt-10'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Connect Your Tools</h2>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Google Calendar Integration */}
          <div className='lg:col-span-1'>
            <GoogleCalendarIntegration />
          </div>

          {/* Working Hours Manager - Only show when calendar is connected */}
          {isConnected && therapistId && (
            <div className='lg:col-span-1'>
              <WorkingHoursManager
                therapistId={parseInt(therapistId)}
                isCalendarConnected={isConnected}
              />
            </div>
          )}

          {/* Placeholder for future integrations - spans full width when working hours not shown */}
          <div
            className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${!isConnected || !therapistId ? 'lg:col-span-2' : 'lg:col-span-2'}`}
          >
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
                <h3 className='text-lg font-semibold text-gray-800'>
                  More Integrations Coming Soon
                </h3>
                <p className='text-gray-500 text-sm'>
                  We're working on additional integrations to enhance your workflow
                </p>
              </div>
            </div>
            <p className='text-gray-600'>
              Future integrations may include Zoom, Microsoft Teams, Slack, and other productivity
              tools to streamline your practice management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
