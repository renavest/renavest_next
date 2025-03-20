'use client';

import { useUser } from '@clerk/nextjs';

import {
  employeeMetricsSignal,
  hsaMetricsSignal,
  programStatsSignal,
} from '@/src/features/employer-dashboard/state/employerDashboardState';
import { cn } from '@/src/lib/utils';
import MetricCard from '@/src/shared/components/MetricCard';
import { COLORS } from '@/src/styles/colors';

function MetricsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='space-y-6'>
      <div className='flex items-center gap-4'>
        <h2 className='text-xl md:text-2xl font-semibold text-gray-800'>{title}</h2>
        <div className={cn('h-px flex-grow', COLORS.WARM_PURPLE[20])} />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>{children}</div>
    </section>
  );
}

function DashboardContent() {
  const hsaMetrics = hsaMetricsSignal.value;
  const employeeMetrics = employeeMetricsSignal.value;
  const programStats = programStatsSignal.value;

  return (
    <>
      {/* HSA Metrics */}
      <MetricsSection title='HSA Program Metrics'>
        <MetricCard
          title='Total Contributions'
          value={`$${hsaMetrics.totalContributions.toLocaleString()}`}
          subtitle='Year to date'
          trend={+15}
        />
        <MetricCard
          title='Average Contribution'
          value={`$${hsaMetrics.averageContribution.toLocaleString()}`}
          subtitle='Per employee'
          trend={+8}
        />
        <MetricCard
          title='Participation Rate'
          value={`${hsaMetrics.participationRate}%`}
          subtitle='Of eligible employees'
          trend={+5}
        />
        <MetricCard
          title='YoY Growth'
          value={`${hsaMetrics.yearOverYearGrowth}%`}
          subtitle='In total contributions'
          trend={+12}
        />
      </MetricsSection>

      {/* Employee Engagement */}
      <MetricsSection title='Employee Engagement'>
        <MetricCard
          title='Total Employees'
          value={employeeMetrics.totalEmployees}
          subtitle='In the program'
          trend={+3}
        />
        <MetricCard
          title='Active Users'
          value={employeeMetrics.activeInProgram}
          subtitle='This month'
          trend={+7}
        />
        <MetricCard
          title='Average Engagement'
          value={`${employeeMetrics.averageEngagement}%`}
          subtitle='Platform usage'
          trend={+10}
        />
        <MetricCard
          title='Therapist Utilization'
          value={`${employeeMetrics.therapistUtilization}%`}
          subtitle='Of active users'
          trend={+15}
        />
      </MetricsSection>

      {/* Program Stats */}
      <MetricsSection title='Program Overview'>
        <MetricCard
          title='Total HSA Spend'
          value={`$${programStats.totalHSASpend.toLocaleString()}`}
          subtitle='All employees'
          trend={+20}
        />
        <MetricCard
          title='Average Balance'
          value={`$${programStats.averageEmployeeBalance.toLocaleString()}`}
          subtitle='Per employee'
          trend={+5}
        />
        <MetricCard
          title='Program ROI'
          value={`${programStats.programROI}x`}
          subtitle='Return on investment'
          trend={+25}
        />
        <MetricCard
          title='Wellness Score'
          value={programStats.wellnessScore}
          subtitle='Out of 100'
          trend={+8}
        />
      </MetricsSection>
    </>
  );
}

export default function EmployerDashboardPage() {
  const { user } = useUser();

  return (
    <div className={cn('min-h-screen pb-8', COLORS.WARM_WHITE.bg)}>
      {/* Header Bar */}
      <div
        className={cn('fixed top-0 left-0 right-0 h-48 z-0', COLORS.WARM_PURPLE.bg, 'opacity-95')}
      />

      <main className='relative z-10 container mx-auto px-4 pt-24 md:pt-32 pb-8 space-y-12'>
        {/* Welcome Section */}
        <div className='mb-8 md:mb-12'>
          <h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>
            Welcome back, {user?.firstName}
          </h1>
          <p className={cn('text-base md:text-lg text-white/80')}>
            Here's an overview of your HSA program and employee wellness metrics.
          </p>
        </div>

        <DashboardContent />
      </main>
    </div>
  );
}
