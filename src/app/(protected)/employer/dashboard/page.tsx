'use client';

import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import FinancialGoalsChart from '@/src/features/employer-dashboard/components/FinancialGoalsChart';
import LoginFrequencyChart from '@/src/features/employer-dashboard/components/LoginFrequencyChart';
import {
  engagementMetricsSignal,
  financialGoalsMetricsSignal,
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
  const percentage =
    stats.totalEmployees > 0
      ? ((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(0)
      : '0';

  return (
    <MetricsSection title='Program Overview'>
      <MetricCard
        title='Total Employees'
        value={stats.totalEmployees}
        subtitle='Total headcount'
        trend={+3}
      />
      <MetricCard
        title='Active Employees'
        value={stats.activeEmployees}
        subtitle={`${percentage}% of total`}
        trend={+7}
      />
      <MetricCard
        title='With Goals'
        value={stats.employeesWithGoals}
        subtitle='Setting goals'
        trend={+15}
      />
      <MetricCard
        title='With Sessions'
        value={stats.employeesWithSessions}
        subtitle='Booked sessions'
        trend={+12}
      />
    </MetricsSection>
  );
}

function SessionsSection() {
  const metrics = sessionMetricsSignal.value;
  const completionRate =
    metrics.totalSessions > 0
      ? ((metrics.completedSessions / metrics.totalSessions) * 100).toFixed(0)
      : '0';

  return (
    <MetricsSection title='Sessions Overview'>
      <MetricCard
        title='Total Sessions'
        value={metrics.totalSessions}
        subtitle='All time'
        trend={+10}
      />
      <MetricCard
        title='Completed'
        value={metrics.completedSessions}
        subtitle={`${completionRate}% completion`}
        trend={+8}
      />
      <MetricCard
        title='This Month'
        value={metrics.sessionsThisMonth}
        subtitle='Current period'
        trend={+12}
      />
      <MetricCard
        title='Upcoming'
        value={metrics.upcomingSessions}
        subtitle='Scheduled'
        trend={+5}
      />
    </MetricsSection>
  );
}

function FinancialGoalsSection() {
  const metrics = financialGoalsMetricsSignal.value;
  const completionRate =
    metrics.totalGoalsSet > 0
      ? ((metrics.goalsCompleted / metrics.totalGoalsSet) * 100).toFixed(0)
      : '0';

  return (
    <MetricsSection title='Financial Goals'>
      <MetricCard
        title='Total Goals'
        value={metrics.totalGoalsSet}
        subtitle='Goals created'
        trend={+20}
      />
      <MetricCard
        title='Completed'
        value={metrics.goalsCompleted}
        subtitle={`${completionRate}% success rate`}
        trend={+15}
      />
      <MetricCard
        title='Active Users'
        value={engagementMetricsSignal.value.monthlyActiveUsers}
        subtitle='This month'
        trend={+25}
      />
      <MetricCard
        title='Daily Users'
        value={engagementMetricsSignal.value.dailyActiveUsers}
        subtitle='Today'
        trend={+8}
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
        <FinancialGoalsChart />
      </div>
      <SessionsSection />
      <FinancialGoalsSection />
    </div>
  );
}

export default function EmployerDashboardPage() {
  const { user, signOut } = useClerk();
  const router = useRouter();

  const handleLogout = () => {
    if (user) {
      signOut();
    } else {
      router.push('/login');
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50')}>
      <header className='bg-white border-b border-purple-100'>
        <div className='container mx-auto px-6 py-8'>
          <div className='flex justify-between items-start'>
            <div className='max-w-2xl'>
              <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
                Welcome back, {user?.firstName || 'Guest'}
              </h1>
              <p className='text-base md:text-lg text-gray-600'>
                Track your employee financial wellness program participation and progress.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors'
            >
              <LogOut className='h-5 w-5' />
              <span className='hidden md:inline'>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-6 py-12'>
        <DashboardContent />
      </main>
    </div>
  );
}
