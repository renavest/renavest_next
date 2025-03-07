'use client';
import { useEffect, useState } from 'react';

import DashboardHeader from '@/src/features/dashboard/components/DashboardHeader';
import ActionableInsights from '@/src/features/dashboard/components/insights/ActionableInsights';
import ComparisonChart from '@/src/features/dashboard/components/insights/ComparisonChart';
import ExploreTherapists from '@/src/features/dashboard/components/insights/ExploreTherapists';
import FinancialGoals from '@/src/features/dashboard/components/insights/Goals';
import TherapistConnection from '@/src/features/dashboard/components/insights/TherapistConnection';
import WeeklyMoneyScript from '@/src/features/dashboard/components/insights/WeeklyMoneyScript';
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
      <main className='container mx-auto px-4 pt-32 pb-8'>
        {/* Welcome Section */}
        <div className='mb-12'>
          <h2 className='text-4xl font-bold text-gray-800'>Welcome back, Alex</h2>
          <p className='text-gray-500 mt-2 text-lg'>
            Let's continue your financial wellness journey.
          </p>
        </div>

        {/* Weekly Focus - Full Width */}
        <div className='mb-12'>
          <WeeklyMoneyScript />
        </div>

        {/* Two Column Layout */}
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Main Content Column */}
          <div className='lg:col-span-8 space-y-12'>
            <section>
              <h2 className='text-2xl font-semibold text-gray-800 mb-6'>Action Items</h2>
              <ActionableInsights />
            </section>

            <section>
              <h2 className='text-2xl font-semibold text-gray-800 mb-6'>Your Financial Goals</h2>
              <FinancialGoals />
            </section>

            <section>
              <h2 className='text-2xl font-semibold text-gray-800 mb-6'>Progress Overview</h2>
              <div className='bg-white rounded-xl p-6 shadow-sm'>
                <div className='max-w-3xl mx-auto'>
                  <ComparisonChart />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-4'>
            <div className='space-y-8 sticky top-32'>
              <TherapistConnection />
              <ExploreTherapists />
            </div>
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingModal />}
    </div>
  );
}
