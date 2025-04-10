'use client';

import { engagementMetricsSignal } from '@/src/features/employer-dashboard/state/employerDashboardState';
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

export function EngagementSection() {
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
