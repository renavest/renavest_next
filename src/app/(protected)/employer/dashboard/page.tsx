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

function KeyMetricsSection() {
  const programStats = programStatsSignal.value;
  const financialGoals = financialGoalsMetricsSignal.value;

  return (
    <MetricsSection title='Key Metrics'>
      <MetricCard
        title='Total Employees'
        value={programStats.totalEmployees}
        subtitle='Platform access'
        trend={+3}
      />
      <MetricCard
        title='Active Users'
        value={programStats.activeUsers}
        subtitle='This month'
        trend={+7}
      />
      <MetricCard
        title='Goals Progress'
        value={`${financialGoals.avgProgressPercentage}%`}
        subtitle='Average completion'
        trend={+15}
      />
      <MetricCard
        title='Satisfaction'
        value={programStats.satisfactionScore}
        subtitle='Out of 100'
        trend={+5}
      />
    </MetricsSection>
  );
}

function EngagementSection() {
  const metrics = engagementMetricsSignal.value;

  return (
    <MetricsSection title='User Engagement'>
      <MetricCard
        title='Daily Active'
        value={metrics.dailyActiveUsers}
        subtitle='Users today'
        trend={+10}
      />
      <MetricCard
        title='Weekly Active'
        value={metrics.weeklyActiveUsers}
        subtitle='Past 7 days'
        trend={+8}
      />
      <MetricCard
        title='Monthly Active'
        value={metrics.monthlyActiveUsers}
        subtitle='This month'
        trend={+12}
      />
      <MetricCard
        title='Sessions/Week'
        value={metrics.averageSessionsPerWeek.toFixed(1)}
        subtitle='Per user avg'
        trend={+5}
      />
    </MetricsSection>
  );
}

function FinancialGoalsSection() {
  const metrics = financialGoalsMetricsSignal.value;

  return (
    <MetricsSection title='Financial Goals'>
      <MetricCard
        title='Total Goals'
        value={metrics.totalGoalsSet}
        subtitle='Goals created'
        trend={+20}
      />
      <MetricCard
        title='In Progress'
        value={metrics.goalsInProgress}
        subtitle='Active goals'
        trend={+15}
      />
      <MetricCard
        title='Achieved'
        value={metrics.goalsAchieved}
        subtitle='Completed goals'
        trend={+25}
      />
      <MetricCard
        title='Success Rate'
        value={`${((metrics.goalsAchieved / metrics.totalGoalsSet) * 100).toFixed(1)}%`}
        subtitle='Completion rate'
        trend={+8}
      />
    </MetricsSection>
  );
}

function DashboardContent() {
  return (
    <div className='space-y-16'>
      <KeyMetricsSection />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <LoginFrequencyChart />
        <FinancialGoalsChart />
      </div>
      <EngagementSection />
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
      {/* Header */}
      <header className='bg-white border-b border-purple-100'>
        <div className='container mx-auto px-6 py-8'>
          <div className='flex justify-between items-start'>
            <div className='max-w-2xl'>
              <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
                Welcome back, {user?.firstName || 'Guest'}
              </h1>
              <p className='text-base md:text-lg text-gray-600'>
                Track your employee financial wellness program engagement and impact.
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
