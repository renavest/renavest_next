'use client';

import { useUser } from '@clerk/nextjs';
import { CreditCard, Calendar, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { GoogleCalendarIntegration } from '@/src/features/google-calendar/components/GoogleCalendarIntegration';
import { StripeConnectIntegration } from '@/src/features/stripe/components/StripeConnectIntegration';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';

type IntegrationType = 'stripe' | 'calendar' | null;

// Integration Card Components
function StripeCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className='bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all cursor-pointer group'
    >
      <div className='flex items-center justify-between mb-6'>
        <div className='w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors'>
          <CreditCard className='w-8 h-8 text-blue-600' />
        </div>
        <ChevronRight className='w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors' />
      </div>
      <div>
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>Stripe Payments</h3>
        <p className='text-gray-600 mb-4'>
          Connect your bank account to receive payments from client sessions automatically.
        </p>
        <div className='flex items-center text-sm'>
          <div className='w-2 h-2 bg-gray-400 rounded-full mr-2'></div>
          <span className='text-gray-500'>Connect your bank account</span>
        </div>
        <div className='flex items-center text-sm mt-1'>
          <div className='w-2 h-2 bg-gray-400 rounded-full mr-2'></div>
          <span className='text-gray-500'>Receive payments automatically</span>
        </div>
        <div className='flex items-center text-sm mt-1'>
          <div className='w-2 h-2 bg-gray-400 rounded-full mr-2'></div>
          <span className='text-gray-500'>Keep 90% of session fees</span>
        </div>
      </div>
    </div>
  );
}

function CalendarCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className='bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all cursor-pointer group'
    >
      <div className='flex items-center justify-between mb-6'>
        <div className='w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors'>
          <Calendar className='w-8 h-8 text-green-600' />
        </div>
        <ChevronRight className='w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors' />
      </div>
      <div>
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>Google Calendar</h3>
        <p className='text-gray-600 mb-4'>
          Sync your Renavest sessions with Google Calendar and manage your availability.
        </p>
        <div className='flex items-center text-sm'>
          <div className='w-2 h-2 bg-gray-400 rounded-full mr-2'></div>
          <span className='text-gray-500'>Automatic session sync</span>
        </div>
        <div className='flex items-center text-sm mt-1'>
          <div className='w-2 h-2 bg-gray-400 rounded-full mr-2'></div>
          <span className='text-gray-500'>Manage availability</span>
        </div>
        <div className='flex items-center text-sm mt-1'>
          <div className='w-2 h-2 bg-gray-400 rounded-full mr-2'></div>
          <span className='text-gray-500'>Prevent double bookings</span>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const { user } = useUser();
  const [therapistId, setTherapistId] = useState<number | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>(null);

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

  if (selectedIntegration === 'stripe') {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
        <TherapistNavbar
          pageTitle='Stripe Integration'
          showBackButton={true}
          backButtonHref='/therapist/integrations'
        />

        <div className='max-w-4xl mx-auto mt-10'>
          <div className='mb-8'>
            <button
              onClick={() => setSelectedIntegration(null)}
              className='flex items-center text-purple-600 hover:text-purple-700 mb-4'
            >
              <ChevronRight className='w-4 h-4 mr-2 rotate-180' />
              Back to Integrations
            </button>
            <h1 className='text-3xl font-bold text-gray-900 mb-3'>Stripe Payment Integration</h1>
            <p className='text-gray-600 text-lg'>
              Connect your bank account to receive payments from client sessions.
            </p>
          </div>

          {therapistId && <StripeConnectIntegration therapistId={therapistId} />}
        </div>
      </div>
    );
  }

  if (selectedIntegration === 'calendar') {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
        <TherapistNavbar
          pageTitle='Google Calendar Integration'
          showBackButton={true}
          backButtonHref='/therapist/integrations'
        />

        <div className='max-w-4xl mx-auto mt-10'>
          <div className='mb-8'>
            <button
              onClick={() => setSelectedIntegration(null)}
              className='flex items-center text-purple-600 hover:text-purple-700 mb-4'
            >
              <ChevronRight className='w-4 h-4 mr-2 rotate-180' />
              Back to Integrations
            </button>
            <h1 className='text-3xl font-bold text-gray-900 mb-3'>Google Calendar Integration</h1>
            <p className='text-gray-600 text-lg'>
              Sync your Renavest sessions with your Google Calendar and manage availability.
            </p>
          </div>

          <GoogleCalendarIntegration />
        </div>
      </div>
    );
  }

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

        <div className='grid md:grid-cols-2 gap-6'>
          {/* Stripe Integration Card */}
          <StripeCard onClick={() => setSelectedIntegration('stripe')} />

          {/* Google Calendar Integration Card */}
          <CalendarCard onClick={() => setSelectedIntegration('calendar')} />
        </div>

        {/* Coming Soon Section */}
        <div className='mt-12'>
          <h2 className='text-xl font-semibold text-gray-800 mb-6'>Coming Soon</h2>
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
  );
}
