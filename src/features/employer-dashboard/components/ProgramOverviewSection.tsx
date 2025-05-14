'use client';

import { useState } from 'react';

import CreditRequestsModal from '@/src/features/employer-dashboard/components/CreditRequestsModal';
import {
  employeeMetricsSignal,
  programStatsSignal,
  sessionMetricsSignal,
} from '@/src/features/employer-dashboard/state/employerDashboardState';
import MetricCard from '@/src/shared/components/MetricCard';

export function ProgramOverviewSection() {
  const stats = programStatsSignal.value;
  const sessionMetrics = sessionMetricsSignal.value;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const platformAdoption =
    stats.totalEmployees > 0
      ? Math.round((employeeMetricsSignal.value.activeInProgram / stats.totalEmployees) * 100)
      : 0;

  return (
    <>
      <div className='flex flex-col md:flex-row gap-8'>
        <div className='flex flex-row gap-4'>
          <MetricCard
            title='Platform Login Rate'
            value={`${platformAdoption}%`}
            subtitle='Created accounts'
            trend={+7}
            className='bg-gray-50 border border-gray-200 shadow-sm text-indigo-900 rounded-xl h-full w-[300px]'
            titleClassName='text-gray-600'
            valueClassName='text-indigo-600'
            subtitleClassName='text-gray-500'
            trendClassName='text-green-600'
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
              className='bg-gray-50 border border-gray-200 shadow-sm text-yellow-900 rounded-xl h-full w-[300px]'
              titleClassName='text-gray-600'
              valueClassName='text-yellow-600'
              subtitleClassName='text-gray-500'
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
