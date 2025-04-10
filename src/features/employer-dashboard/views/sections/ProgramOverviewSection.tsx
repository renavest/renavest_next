'use client';

import { useState } from 'react';

import CreditRequestsModal from '@/src/features/employer-dashboard/components/CreditRequestsModal';
import {
  engagementMetricsSignal,
  programStatsSignal,
  sessionMetricsSignal,
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

export function ProgramOverviewSection() {
  const stats = programStatsSignal.value;
  const metrics = engagementMetricsSignal.value;
  const sessionMetrics = sessionMetricsSignal.value;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const platformAdoption =
    stats.totalEmployees > 0
      ? ((metrics.monthlyActiveUsers / stats.totalEmployees) * 100).toFixed(0)
      : '0';
  const firstSessionRate =
    stats.totalEmployees > 0
      ? ((stats.employeesWithSessions / stats.totalEmployees) * 100).toFixed(0)
      : '0';

  return (
    <>
      <MetricsSection title='Program Overview'>
        <MetricCard
          title='Total Employees'
          value={stats.totalEmployees}
          subtitle='In your organization'
          trend={+3}
        />
        <MetricCard
          title='Platform Login Rate'
          value={`${platformAdoption}%`}
          subtitle='Created accounts'
          trend={+7}
        />
        <MetricCard
          title='First Session Booked'
          value={`${firstSessionRate}%`}
          subtitle='Started their journey'
          trend={+15}
        />
        <div
          onClick={() => setIsModalOpen(true)}
          className='cursor-pointer transition-transform hover:scale-105'
        >
          <MetricCard
            title='Employee Credit Requests'
            value={sessionMetrics.employeesRequestingTopUp}
            subtitle='Employees want more credits'
            trend={+25}
            className='bg-purple-600 text-white'
            trendClassName='text-purple-100'
          />
        </div>
      </MetricsSection>

      <CreditRequestsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestCount={sessionMetrics.employeesRequestingTopUp}
      />
    </>
  );
}
