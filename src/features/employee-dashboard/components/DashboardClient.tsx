'use client';

import { useUser } from '@clerk/nextjs';
import { computed } from '@preact-signals/safe-react';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { MetricsErrorFallback } from '@/src/components/shared/MetricsErrorFallback';
import OnboardingModal from '@/src/features/onboarding/components/OnboardingModal';
import { COLORS } from '@/src/styles/colors';

import { onboardingSignal } from '../../onboarding/state/onboardingState';

import EmployeeNavbar from './EmployeeNavbar';
import PersonalActionableInsights from './insights/PersonalActionableInsights';
import PersonalGoalsTracker from './insights/PersonalGoalsTracker';
import ProgressComparisonChart from './insights/ProgressComparisonChart';
import TherapistConnectionSummary from './insights/TherapistConnectionSummary';
import TherapistRecommendations from './insights/TherapistRecommendations';
import WeeklyFinancialReport from './insights/WeeklyFinancialReport';
// import { MetricsSection } from './sections/MetricsSection';
import { UpcomingSessionsSection } from './UpcomingSessionsSection';

// Create a computed signal for showing onboarding
const showOnboardingSignal = computed(() => {
  return (
    !onboardingSignal.value.isComplete &&
    (typeof window !== 'undefined' ? window.location.pathname !== '/explore' : false)
  );
});

export default function DashboardClient() {
  const { user } = useUser();
  return (
    <div className={`min-h-screen ${COLORS.WARM_WHITE.bg} font-sans`}>
      <EmployeeNavbar />

      {/* Main Content */}
      <main className='container mx-auto px-4 pt-24 md:pt-32 pb-8'>
        {/* Welcome Section */}
        <div className='mb-8 md:mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-800'>
            Welcome back, {user?.firstName} 👋
          </h2>
          <p className='text-gray-500 mt-2 text-base md:text-lg'>
            Your financial wellness journey is unique to you. Let's see how you're progressing and
            what we can focus on today.
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
                Personalized Insights for You
              </h2>
              <p className='text-gray-600 mb-4'>
                Based on your recent financial activity, here are some thoughtful suggestions to
                help you stay on track with your goals.
              </p>
              <PersonalActionableInsights />
            </section>

            <section>
              <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6'>
                Your Financial Journey
              </h2>
              <p className='text-gray-600 mb-4'>
                Every step forward matters. Here's how you're progressing on the goals that matter
                most to you.
              </p>
              <PersonalGoalsTracker />
            </section>

            {/* Chart - Hidden on mobile */}
            <section className='hidden md:block'>
              <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6'>
                Your Monthly Progress
              </h2>
              <p className='text-gray-600 mb-4'>
                See how your financial habits have evolved. These changes reflect your commitment to
                growth.
              </p>
              <div className='bg-white rounded-xl p-4 md:p-6 shadow-sm'>
                <div className='max-w-3xl mx-auto'>
                  <ProgressComparisonChart />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Onboarding Modal */}
        {showOnboardingSignal.value && <OnboardingModal />}
      </main>
    </div>
  );
}
