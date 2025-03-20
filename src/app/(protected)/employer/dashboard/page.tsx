'use client';

import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const activePercentage =
    stats.totalEmployees > 0
      ? ((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(0)
      : '0';
  const sessionUtilization =
    stats.totalEmployees > 0
      ? ((stats.employeesWithSessions / stats.totalEmployees) * 100).toFixed(0)
      : '0';

  return (
    <MetricsSection title='Program Overview'>
      <MetricCard
        title='Total Employees'
        value={stats.totalEmployees}
        subtitle='Registered in platform'
        trend={+3}
      />
      <MetricCard
        title='Platform Usage'
        value={`${activePercentage}%`}
        subtitle='Employees logged in'
        trend={+7}
      />
      <MetricCard
        title='Session Usage'
        value={`${sessionUtilization}%`}
        subtitle='Started sessions'
        trend={+15}
      />
      <MetricCard
        title='Active Users'
        value={stats.activeEmployees}
        subtitle='This month'
        trend={+12}
      />
    </MetricsSection>
  );
}

function SessionsSection() {
  const metrics = sessionMetricsSignal.value;
  const stats = programStatsSignal.value;

  return (
    <MetricsSection title='Sessions Overview'>
      <MetricCard
        title='Started Sessions'
        value={stats.employeesWithSessions}
        subtitle={`${((stats.employeesWithSessions / stats.totalEmployees) * 100).toFixed(0)}% of employees`}
        trend={+10}
      />
      <MetricCard
        title='Completed All'
        value={stats.employeesCompletedAllSessions}
        subtitle={`${((stats.employeesCompletedAllSessions / stats.totalEmployees) * 100).toFixed(0)}% completion rate`}
        trend={+8}
      />
      <MetricCard
        title='This Month'
        value={metrics.sessionsThisMonth}
        subtitle='Active sessions'
        trend={+12}
      />
      <MetricCard
        title='Upcoming'
        value={metrics.upcomingSessions}
        subtitle='Next 30 days'
        trend={+5}
      />
    </MetricsSection>
  );
}

function EngagementSection() {
  const metrics = engagementMetricsSignal.value;
  const stats = programStatsSignal.value;
  const weeklyPercentage =
    stats.totalEmployees > 0
      ? ((metrics.weeklyActiveUsers / stats.totalEmployees) * 100).toFixed(0)
      : '0';
  const monthlyPercentage =
    stats.totalEmployees > 0
      ? ((metrics.monthlyActiveUsers / stats.totalEmployees) * 100).toFixed(0)
      : '0';

  return (
    <MetricsSection title='Platform Engagement'>
      <MetricCard
        title='Weekly Active'
        value={metrics.weeklyActiveUsers}
        subtitle={`${weeklyPercentage}% of employees`}
        trend={+15}
      />
      <MetricCard
        title='Monthly Active'
        value={metrics.monthlyActiveUsers}
        subtitle={`${monthlyPercentage}% of employees`}
        trend={+25}
      />
      <MetricCard
        title='Daily Logins'
        value={metrics.dailyActiveUsers}
        subtitle='Users today'
        trend={+20}
      />
      <MetricCard title='Peak Activity' value='Tuesday' subtitle='Highest engagement' trend={+8} />
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
  const { user, signOut } = useClerk();
  const router = useRouter();
  const stats = programStatsSignal.value;
  const activePercentage = ((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(0);

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
                {activePercentage}% of your {stats.totalEmployees} employees are actively using the
                platform
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={handleLogout}
                className='flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors'
              >
                <LogOut className='h-5 w-5' />
                <span className='hidden md:inline'>Logout</span>
              </button>
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
