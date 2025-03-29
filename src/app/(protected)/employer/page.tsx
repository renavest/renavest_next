'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useState } from 'react';

import { LogoutButton } from '@/src/components/shared/LogoutButton';
import { ALLOWED_EMAILS } from '@/src/constants';
import CreditRequestsModal from '@/src/features/employer-dashboard/components/CreditRequestsModal';
import LoginFrequencyChart from '@/src/features/employer-dashboard/components/LoginFrequencyChart';
import SessionsChart from '@/src/features/employer-dashboard/components/SessionsChart';
import {
  engagementMetricsSignal,
  programStatsSignal,
  sessionMetricsSignal,
} from '@/src/features/employer-dashboard/state/employerDashboardState';
import { cn } from '@/src/lib/utils';
import MetricCard from '@/src/shared/components/MetricCard';

function MetricsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='space-y-8'>
      <div className='flex items-center gap-4'>
        <h2 className='text-xl md:text-2xl font-semibold text-gray-700'>{title}</h2>
        <div className='h-px flex-grow bg-purple-50' />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>{children}</div>
    </section>
  );
}

function ProgramOverviewSection() {
  const stats = programStatsSignal.value;
  const metrics = engagementMetricsSignal.value;
  const sessionMetrics = sessionMetricsSignal.value;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const platformAdoption =
    stats.totalEmployees > 0
      ? ((metrics.monthlyActiveUsers / stats.totalEmployees) * 100).toFixed(0)
      : '0';
  const firstSessionRate =
    stats.totalEmployees > 0
      ? ((stats.employeesWithSessions / stats.totalEmployees) * 100).toFixed(0)
      : '0';

  return (
    <>
      <MetricsSection title='Program Overview'>
        <MetricCard
          title='Total Employees'
          value={stats.totalEmployees}
          subtitle='In your organization'
          trend={+3}
        />
        <MetricCard
          title='Platform Login Rate'
          value={`${platformAdoption}%`}
          subtitle='Created accounts'
          trend={+7}
        />
        <MetricCard
          title='First Session Booked'
          value={`${firstSessionRate}%`}
          subtitle='Started their journey'
          trend={+15}
        />
        <div
          onClick={() => setIsModalOpen(true)}
          className='cursor-pointer transition-transform hover:scale-105'
        >
          <MetricCard
            title='Employee Credit Requests'
            value={sessionMetrics.employeesRequestingTopUp}
            subtitle='Employees want more credits'
            trend={+25}
            className='bg-purple-600 text-white'
            trendClassName='text-purple-100'
          />
        </div>
      </MetricsSection>

      <CreditRequestsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestCount={sessionMetrics.employeesRequestingTopUp}
      />
    </>
  );
}

function SessionsSection() {
  const metrics = sessionMetricsSignal.value;
  const stats = programStatsSignal.value;

  return (
    <MetricsSection title='Sessions Overview'>
      <MetricCard
        title='Started Program'
        value={stats.employeesWithSessions}
        subtitle={`${((stats.employeesWithSessions / stats.totalEmployees) * 100).toFixed(0)}% booked first session`}
        trend={+10}
      />
      <MetricCard
        title='Exhausted All Credits'
        value={stats.employeesCompletedAllSessions}
        subtitle={`${((stats.employeesCompletedAllSessions / stats.totalEmployees) * 100).toFixed(0)}% used all 400 credits`}
        trend={+8}
      />
      <MetricCard
        title='Current Sessions'
        value={metrics.sessionsThisMonth}
        subtitle='Active this month'
        trend={+12}
      />
      <MetricCard
        title='Scheduled Sessions'
        value={metrics.upcomingSessions}
        subtitle='Next 30 days'
        trend={+5}
      />
    </MetricsSection>
  );
}

function EngagementSection() {
  const metrics = engagementMetricsSignal.value;

  return (
    <MetricsSection title='Platform Engagement'>
      <MetricCard
        title="Today's Logins"
        value={metrics.dailyActiveUsers}
        subtitle='Unique users today'
        trend={+20}
      />
      <MetricCard title='Average Sessions' value='3.2' subtitle='Per employee' trend={+15} />
      <MetricCard title='Return Rate' value='85%' subtitle='Book multiple sessions' trend={+15} />
      <MetricCard
        title='Weekly Active'
        value={metrics.weeklyActiveUsers}
        subtitle='Past 7 days'
        trend={+10}
      />
    </MetricsSection>
  );
}

function DashboardContent() {
  return (
    <div className='space-y-16'>
      <ProgramOverviewSection />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <LoginFrequencyChart />
        <SessionsChart />
      </div>
      <SessionsSection />
      <EngagementSection />
    </div>
  );
}

export default function EmployerDashboardPage() {
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
        <DashboardContent />
      </main>
    </div>
  );
}
