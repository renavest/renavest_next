'use client';

import { ActivitySquare, BarChart, Repeat, Users } from 'lucide-react';

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
        icon={ActivitySquare}
        iconClassName='bg-emerald-100'
        className='bg-gradient-to-br from-emerald-100 to-emerald-300 text-emerald-900 shadow-lg rounded-xl'
      />
      <MetricCard
        title='Average Sessions'
        value='3.2'
        subtitle='Per employee'
        trend={+15}
        icon={BarChart}
        iconClassName='bg-indigo-100'
        className='bg-gradient-to-br from-indigo-100 to-indigo-300 text-indigo-900 shadow-lg rounded-xl'
      />
      <MetricCard
        title='Return Rate'
        value='85%'
        subtitle='Book multiple sessions'
        trend={+15}
        icon={Repeat}
        iconClassName='bg-violet-100'
        className='bg-gradient-to-br from-violet-100 to-violet-300 text-violet-900 shadow-lg rounded-xl'
      />
      <MetricCard
        title='Weekly Active'
        value={metrics.weeklyActiveUsers}
        subtitle='Past 7 days'
        trend={+10}
        icon={Users}
        iconClassName='bg-sky-100'
        className='bg-gradient-to-br from-sky-100 to-sky-300 text-sky-900 shadow-lg rounded-xl'
      />
    </MetricsSection>
  );
}
