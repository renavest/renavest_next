'use client';
import { useEffect, useState } from 'react';

import DashboardHeader from '@/src/features/dashboard/components/DashboardHeader';
import PersonalActionableInsights from '@/src/features/dashboard/components/insights/PersonalActionableInsights';
import PersonalGoalsTracker from '@/src/features/dashboard/components/insights/PersonalGoalsTracker';
import ProgressComparisonChart from '@/src/features/dashboard/components/insights/ProgressComparisonChart';
import TherapistConnectionSummary from '@/src/features/dashboard/components/insights/TherapistConnectionSummary';
import TherapistRecommendations from '@/src/features/dashboard/components/insights/TherapistRecommendations';
import WeeklyFinancialReport from '@/src/features/dashboard/components/insights/WeeklyFinancialReport';
import OnboardingModal from '@/src/features/onboarding/components/OnboardingModal';
import { onboardingSignal } from '@/src/features/onboarding/state/onboardingState';

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(!onboardingSignal.value.isComplete);

  useEffect(() => {
    const unsubscribe = onboardingSignal.subscribe((newValue) => {
      setShowOnboarding(!newValue.isComplete);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className='min-h-screen bg-[#faf9f6] font-sans'>
      <DashboardHeader />

      {/* Main Content */}
      <main className='container mx-auto px-4 pt-24 md:pt-32 pb-8'>
        {/* Welcome Section */}
        <div className='mb-8 md:mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-800'>Welcome back, Alex</h2>
          <p className='text-gray-500 mt-2 text-base md:text-lg'>
            Let's continue your financial wellness journey.
          </p>
        </div>

        {/* Weekly Focus - Full Width */}
        <div className='mb-8 md:mb-12'>
          <WeeklyFinancialReport />
        </div>

        {/* Mobile-First Layout */}
        <div className='space-y-8 md:space-y-0 md:grid md:grid-cols-12 md:gap-8'>
          {/* Sidebar - Moves to top on mobile */}
          <div className='md:col-span-4 md:order-2'>
            <div className='space-y-8 md:sticky md:top-32'>
              <TherapistConnectionSummary />
              <div className='md:block'>
                <TherapistRecommendations />
              </div>
            </div>
          </div>

          {/* Main Content Column */}
          <div className='md:col-span-8 space-y-8 md:space-y-12 md:order-1'>
            <section>
              <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6'>
                Action Items
              </h2>
              <PersonalActionableInsights />
            </section>

            <section>
              <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6'>
                Your Financial Goals
              </h2>
              <PersonalGoalsTracker />
            </section>

            {/* Chart - Hidden on mobile */}
            <section className='hidden md:block'>
              <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6'>
                Progress Overview
              </h2>
              <div className='bg-white rounded-xl p-4 md:p-6 shadow-sm'>
                <div className='max-w-3xl mx-auto'>
                  <ProgressComparisonChart />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal />}
    </div>
  );
}
