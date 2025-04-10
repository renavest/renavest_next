'use client';

import { fetchEmployerDashboardMetrics } from '@/src/features/employer-dashboard/actions/employerDashboardActions';
import { therapistMetricsSignal } from '@/src/features/employer-dashboard/state/employerDashboardState';
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

export async function TherapistSection() {
  try {
    const metrics = await fetchEmployerDashboardMetrics();
    therapistMetricsSignal.value = metrics.therapistMetrics;
    const therapistMetric = therapistMetricsSignal.value;

    return (
      <MetricsSection title='Therapist Performance'>
        <MetricCard
          title='Total Therapists'
          value={therapistMetric.totalTherapists}
          subtitle='In our network'
          trend={+5}
        />
        <MetricCard
          title='Active Therapists'
          value={therapistMetric.activeTherapists}
          subtitle='Currently taking sessions'
          trend={+10}
        />
        <MetricCard
          title='Avg Sessions/Therapist'
          value={therapistMetric.averageSessionsPerTherapist.toFixed(1)}
          subtitle='Monthly average'
          trend={+8}
        />
        <MetricCard
          title='Therapist Utilization'
          value={`${therapistMetric.therapistUtilizationRate.toFixed(0)}%`}
          subtitle='Network engagement'
          trend={+12}
        />
      </MetricsSection>
    );
  } catch (error) {
    console.error('Failed to load therapist metrics:', error);
    return (
      <div className='bg-red-50 p-4 rounded-lg'>
        <h3 className='text-red-700 font-semibold'>Error Loading Therapist Metrics</h3>
        <p className='text-red-600 text-sm mt-2'>
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}
