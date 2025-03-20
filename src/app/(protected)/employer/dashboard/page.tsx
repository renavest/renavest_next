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

export default function EmployerDashboardPage() {
  const { user } = useUser();
  const hsaMetrics = hsaMetricsSignal.value;
  const employeeMetrics = employeeMetricsSignal.value;
  const programStats = programStatsSignal.value;

  return (
    <div className={cn('min-h-screen', COLORS.WARM_WHITE.bg)}>
      <main className='container mx-auto px-4 pt-24 md:pt-32 pb-8'>
        {/* Welcome Section */}
        <div className='mb-8 md:mb-12'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-800'>
            Welcome back, {user?.firstName}
          </h1>
          <p className='text-gray-500 mt-2 text-base md:text-lg'>
            Here's an overview of your HSA program and employee wellness metrics.
          </p>
        </div>

        {/* HSA Metrics */}
        <section className='mb-8 md:mb-12'>
          <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4'>
            HSA Program Metrics
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <MetricCard
              title='Total Contributions'
              value={`$${hsaMetrics.totalContributions.toLocaleString()}`}
              subtitle='Year to date'
            />
            <MetricCard
              title='Average Contribution'
              value={`$${hsaMetrics.averageContribution.toLocaleString()}`}
              subtitle='Per employee'
            />
            <MetricCard
              title='Participation Rate'
              value={`${hsaMetrics.participationRate}%`}
              subtitle='Of eligible employees'
            />
            <MetricCard
              title='YoY Growth'
              value={`${hsaMetrics.yearOverYearGrowth}%`}
              subtitle='In total contributions'
            />
          </div>
        </section>

        {/* Employee Engagement */}
        <section className='mb-8 md:mb-12'>
          <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4'>
            Employee Engagement
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <MetricCard
              title='Total Employees'
              value={employeeMetrics.totalEmployees}
              subtitle='In the program'
            />
            <MetricCard
              title='Active Users'
              value={employeeMetrics.activeInProgram}
              subtitle='This month'
            />
            <MetricCard
              title='Average Engagement'
              value={`${employeeMetrics.averageEngagement}%`}
              subtitle='Platform usage'
            />
            <MetricCard
              title='Therapist Utilization'
              value={`${employeeMetrics.therapistUtilization}%`}
              subtitle='Of active users'
            />
          </div>
        </section>

        {/* Program Stats */}
        <section>
          <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4'>Program Overview</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <MetricCard
              title='Total HSA Spend'
              value={`$${programStats.totalHSASpend.toLocaleString()}`}
              subtitle='All employees'
            />
            <MetricCard
              title='Average Balance'
              value={`$${programStats.averageEmployeeBalance.toLocaleString()}`}
              subtitle='Per employee'
            />
            <MetricCard
              title='Program ROI'
              value={`${programStats.programROI}x`}
              subtitle='Return on investment'
            />
            <MetricCard
              title='Wellness Score'
              value={programStats.wellnessScore}
              subtitle='Out of 100'
            />
          </div>
        </section>
      </main>
    </div>
  );
}
