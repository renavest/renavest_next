'use client';

import { useState } from 'react';

import CreditRequestsModal from '@/src/features/employer-dashboard/components/CreditRequestsModal';
import {
  engagementMetricsSignal,
  programStatsSignal,
  sessionMetricsSignal,
} from '@/src/features/employer-dashboard/state/employerDashboardState';
import MetricCard from '@/src/shared/components/MetricCard';

export function ProgramOverviewSection() {
  const stats = programStatsSignal.value;
  const metrics = engagementMetricsSignal.value;
  const sessionMetrics = sessionMetricsSignal.value;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const platformAdoption =
    stats.totalEmployees > 0
      ? ((metrics.monthlyActiveUsers / stats.totalEmployees) * 100).toFixed(0)
      : '0';

  return (
    <>
      <div className='flex flex-col md:flex-row gap-8'>
        <div className='flex flex-row gap-4'>
          <MetricCard
            title='Platform Login Rate'
            value={`${platformAdoption}%`}
            subtitle='Created accounts'
            trend={+7}
            className='bg-gradient-to-br from-indigo-100 to-indigo-300 text-indigo-900 shadow-lg rounded-xl h-full w-[300px]'
          />
          <div
            onClick={() => setIsModalOpen(true)}
            className='cursor-pointer transition-transform hover:scale-105 w-[300px]'
          >
            <MetricCard
              title='Employee Credit Requests'
              value={sessionMetrics.employeesRequestingTopUp}
              subtitle='Employees want more credits'
              trend={+25}
              className='bg-gradient-to-br from-yellow-100 to-yellow-300 text-yellow-900 shadow-lg rounded-xl h-full w-[300px]'
              trendClassName='text-yellow-700'
            />
          </div>
        </div>
      </div>

      <CreditRequestsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestCount={sessionMetrics.employeesRequestingTopUp}
      />
    </>
  );
}
