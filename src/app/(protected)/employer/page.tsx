'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { ALLOWED_EMAILS } from '@/src/constants';
import { ChartsSections } from '@/src/features/employer-dashboard/components/ChartsSections';
import EmployeeInsightsCard from '@/src/features/employer-dashboard/components/EmployeeInsightsCard';
import EmployerNavbar from '@/src/features/employer-dashboard/components/EmployerNavbar';
import { EngagementSection } from '@/src/features/employer-dashboard/components/EngagementSection';
import { ProgramOverviewSection } from '@/src/features/employer-dashboard/components/ProgramOverviewSection';
import { SessionsSection } from '@/src/features/employer-dashboard/components/SessionsSection';
import { SponsoredGroupsSection } from '@/src/features/employer-dashboard/components/SponsoredGroupsSection';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

export default function EmployerDashboardView() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-purple-600 mx-auto mb-4'></div>
          <p className={`${COLORS.WARM_PURPLE.DEFAULT} text-lg`}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    redirect('/login');
  }

  if (!ALLOWED_EMAILS.includes(user?.emailAddresses[0]?.emailAddress || '')) {
    redirect('/explore');
  }

  return (
    <div className={cn('min-h-screen', COLORS.WARM_WHITE.bg)}>
      <EmployerNavbar />

      <main className='container mx-auto px-6 pt-16 md:pt-24 pb-12'>
        {/* Program Overview Heading */}
        <h2 className='text-2xl md:text-3xl font-bold text-gray-800 mb-8'>Program Overview</h2>
        {/* Row with all three cards */}
        <div className='flex flex-col md:flex-row gap-8 mb-16 items-stretch'>
          <ProgramOverviewSection />
          <div className='flex-1' />
          <EmployeeInsightsCard />
        </div>

        <div className='space-y-16'>
          <div>
            <h3 className='text-xl md:text-2xl font-bold text-gray-800 mb-6'>Sponsored Groups</h3>
            <SponsoredGroupsSection />
          </div>

          <ChartsSections />

          <SessionsSection />

          <EngagementSection />
        </div>
      </main>
    </div>
  );
}
