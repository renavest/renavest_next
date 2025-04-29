'use client';

import { GoogleCalendarIntegration } from '@/src/features/google-calendar/components/GoogleCalendarIntegration';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';

export default function IntegrationsPage() {
  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar
        pageTitle='Integrations'
        showBackButton={true}
        backButtonHref='/therapist'
      />
      <div className='max-w-md mx-auto mt-10'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Connect Your Tools</h2>
        <div className='space-y-6'>
          <GoogleCalendarIntegration />
          {/* Placeholder for future integrations */}
          <div className='bg-white shadow-md rounded-lg overflow-hidden p-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Coming Soon</h3>
            <p className='text-gray-600'>
              More integrations are on the way to enhance your Renavest experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
