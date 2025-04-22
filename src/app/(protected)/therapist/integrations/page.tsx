'use client';

import Image from 'next/image';

import { GoogleCalendarIntegration } from '@/src/features/google-calendar/components/GoogleCalendarIntegration';

export default function IntegrationsPage() {
  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      {/* Custom Integrations Navbar */}
      <nav className='flex items-center justify-between py-4 px-2 md:px-8 bg-white shadow-sm rounded-xl max-w-2xl mx-auto mt-4 mb-10'>
        <div className='flex items-center gap-3'>
          <Image
            src='/renavestlogo.avif'
            alt='Renavest Butterfly Logo'
            width={40}
            height={40}
            className='object-contain'
          />
          <div>
            <h1 className='text-xl md:text-2xl font-bold text-purple-700'>Integrate Your Tools</h1>
            <p className='text-xs md:text-sm text-gray-500 mt-1'>
              Connect your favorite tools to enhance your Renavest experience
            </p>
          </div>
        </div>
      </nav>
      {/* End Custom Navbar */}
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
