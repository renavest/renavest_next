'use client';

import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { trackTherapistDashboard } from '@/src/features/posthog/therapistTracking';
import { therapistIdSignal } from '@/src/features/therapist-dashboard/state/therapistDashboardState';

export const QuickActionsSection = () => {
  const [calendarIntegrated, setCalendarIntegrated] = useState<boolean>(false);

  // Check Google Calendar integration status
  useEffect(() => {
    const checkIntegration = async () => {
      if (!therapistIdSignal.value) return;

      try {
        const response = await fetch(
          `/api/google-calendar/status?therapistId=${therapistIdSignal.value}`,
        );
        const data = await response.json();
        setCalendarIntegrated(data.isConnected && data.integrationStatus === 'connected');
      } catch (error) {
        console.error('Error checking calendar integration:', error);
        setCalendarIntegrated(false);
      }
    };

    checkIntegration();
  }, [therapistIdSignal.value]);

  const handleProfileClick = () => {
    if (therapistIdSignal.value) {
      trackTherapistDashboard.quickActionClicked('view_profile', therapistIdSignal.value, {
        user_id: `therapist_${therapistIdSignal.value}`,
      });
    }
  };

  const handleIntegrationsClick = () => {
    if (therapistIdSignal.value) {
      trackTherapistDashboard.quickActionClicked('manage_integrations', therapistIdSignal.value, {
        user_id: `therapist_${therapistIdSignal.value}`,
      });
    }
  };

  const handleDocumentsClick = () => {
    if (therapistIdSignal.value) {
      trackTherapistDashboard.quickActionClicked('manage_documents', therapistIdSignal.value, {
        user_id: `therapist_${therapistIdSignal.value}`,
      });
    }
  };

  const handleAvailabilityClick = () => {
    if (therapistIdSignal.value) {
      trackTherapistDashboard.quickActionClicked('manage_availability', therapistIdSignal.value, {
        user_id: `therapist_${therapistIdSignal.value}`,
      });
    }
  };

  return (
    <div className='mt-6'>
      <h2 className='text-xl font-semibold text-gray-800 mb-4'>Quick Actions</h2>
      <div
        className={`grid grid-cols-1 gap-4 ${calendarIntegrated ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}
      >
        <Link
          href='/therapist/profile'
          onClick={handleProfileClick}
          className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group'
        >
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors'>
              <svg
                className='w-6 h-6 text-purple-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>View & Edit Profile</h3>
              <p className='text-gray-500 text-sm'>Manage your professional information</p>
            </div>
          </div>
        </Link>
        <Link
          href='/therapist/integrations'
          onClick={handleIntegrationsClick}
          className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group'
        >
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors'>
              <svg
                className='w-6 h-6 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
                />
              </svg>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>Manage Integrations</h3>
              <p className='text-gray-500 text-sm'>
                {calendarIntegrated
                  ? 'Connect your bank account, calendar, and other tools'
                  : 'Connect your Google Calendar to manage availability'}
              </p>
            </div>
          </div>
        </Link>
        <Link
          href='/therapist/documents'
          onClick={handleDocumentsClick}
          className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group'
        >
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors'>
              <FileText className='w-6 h-6 text-green-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>Manage Documents</h3>
              <p className='text-gray-500 text-sm'>Upload and share resources with clients</p>
            </div>
          </div>
        </Link>
        {/* Only show availability card if Google Calendar is connected */}
        {calendarIntegrated && (
          <Link
            href='/therapist/availability'
            onClick={handleAvailabilityClick}
            className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group'
          >
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors'>
                <svg
                  className='w-6 h-6 text-amber-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-800'>Manage Availability</h3>
                <p className='text-gray-500 text-sm'>Set working hours and block time slots</p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};
