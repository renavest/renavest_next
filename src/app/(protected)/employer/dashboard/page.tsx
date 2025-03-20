'use client';

import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  employeeMetricsSignal,
  financialWellnessMetricsSignal,
  programStatsSignal,
  sessionMetricsSignal,
  satisfactionMetricsSignal,
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

function SessionEngagementSection() {
  const sessionMetrics = sessionMetricsSignal.value;

  return (
    <MetricsSection title='Session Engagement'>
      <MetricCard
        title='Active Bookings'
        value={sessionMetrics.activeBookings}
        subtitle='Current sessions'
        trend={+10}
      />
      <MetricCard
        title='Credit Usage'
        value={`${sessionMetrics.creditUtilization}%`}
        subtitle='Of allocated credits'
        trend={+15}
      />
      <MetricCard
        title='Session Progress'
        value={`${sessionMetrics.completionRate}%`}
        subtitle='Completing 3+ sessions'
        trend={+8}
      />
      <MetricCard
        title='Avg Sessions'
        value={sessionMetrics.avgSessionsPerEmployee.toFixed(1)}
        subtitle='Per employee'
        trend={+12}
      />
    </MetricsSection>
  );
}

function WellnessImpactSection() {
  const satisfactionMetrics = satisfactionMetricsSignal.value;

  return (
    <MetricsSection title='Wellness Impact'>
      <MetricCard
        title='Satisfaction'
        value={`${satisfactionMetrics.overallSatisfaction}%`}
        subtitle='Overall rating'
        trend={+5}
      />
      <MetricCard
        title='Stress Reduction'
        value={`${satisfactionMetrics.stressReduction}%`}
        subtitle='Report improvement'
        trend={+8}
      />
      <MetricCard
        title='Financial Confidence'
        value={`${satisfactionMetrics.financialConfidence}%`}
        subtitle='Feel more prepared'
        trend={+10}
      />
      <MetricCard
        title='Would Recommend'
        value={`${satisfactionMetrics.recommendationRate}%`}
        subtitle='To colleagues'
        trend={+7}
      />
    </MetricsSection>
  );
}

function ProgramUsageSection() {
  const employeeMetrics = employeeMetricsSignal.value;
  const sessionMetrics = sessionMetricsSignal.value;

  return (
    <MetricsSection title='Program Usage'>
      <MetricCard
        title='Total Employees'
        value={employeeMetrics.totalEmployees}
        subtitle='Currently enrolled'
        trend={+3}
      />
      <MetricCard
        title='Active Users'
        value={employeeMetrics.activeInProgram}
        subtitle='This month'
        trend={+7}
      />
      <MetricCard
        title='Stress Tracking'
        value={`${sessionMetrics.stressTrackerUsage}%`}
        subtitle='Using triggers'
        trend={+15}
      />
      <MetricCard
        title='Coach Sessions'
        value={`${employeeMetrics.coachUtilization}%`}
        subtitle='Booked this month'
        trend={+10}
      />
    </MetricsSection>
  );
}

function ProgramImpactSection() {
  const programStats = programStatsSignal.value;
  const financialMetrics = financialWellnessMetricsSignal.value;

  return (
    <MetricsSection title='Program Impact'>
      <MetricCard
        title='Cost Savings'
        value={`$${programStats.costSavings.toLocaleString()}`}
        subtitle='From reduced turnover'
        trend={+20}
      />
      <MetricCard
        title='Productivity Gain'
        value={`${programStats.productivityGain}%`}
        subtitle='Self-reported'
        trend={+5}
      />
      <MetricCard
        title='Program ROI'
        value={`${programStats.programROI}x`}
        subtitle='Return on investment'
        trend={+25}
      />
      <MetricCard
        title='Retention Impact'
        value={`${financialMetrics.retentionIncrease}%`}
        subtitle='YoY improvement'
        trend={+12}
      />
    </MetricsSection>
  );
}

function DashboardContent() {
  return (
    <div className='space-y-16'>
      <SessionEngagementSection />
      <WellnessImpactSection />
      <ProgramUsageSection />
      <ProgramImpactSection />
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
                Here's an overview of your employee financial wellness program metrics and impact.
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
