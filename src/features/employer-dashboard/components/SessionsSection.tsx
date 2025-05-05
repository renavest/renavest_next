'use client';

import { CalendarCheck, Award, Calendar, CalendarClock } from 'lucide-react';

import {
  sessionMetricsSignal,
  programStatsSignal,
} from '@/src/features/employer-dashboard/state/employerDashboardState';
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

export function SessionsSection() {
  const metrics = sessionMetricsSignal.value;
  const stats = programStatsSignal.value;

  return (
    <MetricsSection title='Sessions Overview'>
      <MetricCard
        title='Started Program'
        value={stats.employeesWithSessions}
        subtitle={`${((stats.employeesWithSessions / stats.totalEmployees) * 100).toFixed(0)}% booked first session`}
        trend={+10}
        icon={CalendarCheck}
        iconClassName='bg-blue-100'
        className='bg-gradient-to-br from-blue-100 to-blue-300 text-blue-900 shadow-lg rounded-xl'
      />
      <MetricCard
        title='Exhausted All Credits'
        value={stats.employeesCompletedAllSessions}
        subtitle={`${((stats.employeesCompletedAllSessions / stats.totalEmployees) * 100).toFixed(0)}% used all 400 credits`}
        trend={+8}
        icon={Award}
        iconClassName='bg-purple-100'
        className='bg-gradient-to-br from-purple-100 to-purple-300 text-purple-900 shadow-lg rounded-xl'
      />
      <MetricCard
        title='Current Sessions'
        value={metrics.sessionsThisMonth}
        subtitle='Active this month'
        trend={+12}
        icon={Calendar}
        iconClassName='bg-teal-100'
        className='bg-gradient-to-br from-teal-100 to-teal-300 text-teal-900 shadow-lg rounded-xl'
      />
      <MetricCard
        title='Scheduled Sessions'
        value={metrics.upcomingSessions}
        subtitle='Next 30 days'
        trend={+5}
        icon={CalendarClock}
        iconClassName='bg-indigo-100'
        className='bg-gradient-to-br from-indigo-100 to-indigo-300 text-indigo-900 shadow-lg rounded-xl'
      />
    </MetricsSection>
  );
}
