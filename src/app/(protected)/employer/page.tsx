'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { MetricsErrorFallback } from '@/src/components/shared/MetricsErrorFallback';
import { ALLOWED_EMAILS } from '@/src/constants';
import { BookingsSection } from '@/src/features/employer-dashboard/components/BookingsSection';
import { ChartsSections } from '@/src/features/employer-dashboard/components/ChartsSections';
import EmployerNavbar from '@/src/features/employer-dashboard/components/EmployerNavbar';
import { EngagementSection } from '@/src/features/employer-dashboard/components/EngagementSection';
import { ProgramOverviewSection } from '@/src/features/employer-dashboard/components/ProgramOverviewSection';
import { SessionsSection } from '@/src/features/employer-dashboard/components/SessionsSection';
import { TherapistSection } from '@/src/features/employer-dashboard/components/TherapistSection';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

export default function EmployerDashboardView() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
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

      <main className='container mx-auto px-6 pt-24 md:pt-32 pb-12'>
        <div className='flex flex-col space-y-4 mb-8'>
          <div className='max-w-2xl'>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
              Welcome back, {user?.firstName || 'Admin'}
            </h1>
            <p className='text-base md:text-lg text-gray-600'>
              Each employee has <strong>400</strong> credits to book sessions.
            </p>
          </div>
        </div>

        <div className='space-y-16'>
          <ProgramOverviewSection />

          <ChartsSections />

          <SessionsSection />

          <EngagementSection />

          {/* <ErrorBoundary FallbackComponent={MetricsErrorFallback}>
            <Suspense
              fallback={
                <div className='bg-white rounded-lg shadow-sm p-4'>
                  Loading therapist metrics...
                </div>
              }
            >
              <TherapistSection />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary FallbackComponent={MetricsErrorFallback}>
            <Suspense
              fallback={
                <div className='bg-white rounded-lg shadow-sm p-4'>Loading booking metrics...</div>
              }
            >
              <BookingsSection />
            </Suspense>
          </ErrorBoundary> */}
        </div>
      </main>
    </div>
  );
}
