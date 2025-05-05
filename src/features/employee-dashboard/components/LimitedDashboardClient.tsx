'use client';

import { COLORS } from '@/src/styles/colors';

import EmployeeNavbar from './EmployeeNavbar';
import TherapistRecommendations from './insights/TherapistRecommendations';
import { UpcomingSessionsSection } from './UpcomingSessionsSection';

export default function LimitedDashboardClient() {
  return (
    <div className={`min-h-screen ${COLORS.WARM_WHITE.bg} font-sans`}>
      <EmployeeNavbar />
      <main className='container mx-auto px-4 pt-24 md:pt-32 pb-8'>
        <div className='mb-8 md:mb-12 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-800 animate-fade-in-up'>
            Your Renavest Dashboard
          </h2>
          <p className='text-gray-500 mt-2 text-base md:text-lg animate-fade-in'>
            See your upcoming sessions and explore our expert therapists.
          </p>
        </div>
        <div className='space-y-8 md:space-y-12 max-w-2xl mx-auto'>
          <UpcomingSessionsSection />
          <TherapistRecommendations />
        </div>
      </main>
    </div>
  );
}
