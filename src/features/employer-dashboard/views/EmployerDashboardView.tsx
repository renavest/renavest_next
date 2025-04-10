'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { LogoutButton } from '@/src/components/shared/LogoutButton';
import { ALLOWED_EMAILS } from '@/src/constants';
import { cn } from '@/src/lib/utils';

import { BookingsSection } from './sections/BookingsSection';
import { ChartsSections } from './sections/ChartsSections';
import { EngagementSection } from './sections/EngagementSection';
import { ProgramOverviewSection } from './sections/ProgramOverviewSection';
import { SessionsSection } from './sections/SessionsSection';
import { TherapistSection } from './sections/TherapistSection';

function MetricsErrorFallback({ error }: { error: Error }) {
  return (
    <div className='bg-red-50 p-4 rounded-lg'>
      <h3 className='text-red-700 font-semibold'>Error Loading Dashboard</h3>
      <p className='text-red-600 text-sm mt-2'>
        {error instanceof Error ? error.message : 'Unknown error'}
      </p>
    </div>
  );
}

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
    <div className={cn('min-h-screen bg-gray-50')}>
      <header className='bg-white border-b border-purple-100'>
        <div className='container mx-auto px-6 py-8'>
          <div className='flex justify-between items-start'>
            <div className='max-w-2xl'>
              <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
                Welcome back, Employer
              </h1>
              <p className='text-base md:text-lg text-gray-600'>
                Each employee has <strong>400</strong> credits to book sessions.
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-6 py-12'>
        <div className='space-y-16'>
          <ProgramOverviewSection />

          <ChartsSections />

          <SessionsSection />

          <EngagementSection />

          <ErrorBoundary
            fallback={
              <MetricsErrorFallback error={new Error('Failed to load therapist metrics')} />
            }
          >
            <Suspense fallback={<div>Loading therapist metrics...</div>}>
              <TherapistSection />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary
            fallback={<MetricsErrorFallback error={new Error('Failed to load booking metrics')} />}
          >
            <Suspense fallback={<div>Loading booking metrics...</div>}>
              <BookingsSection />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
