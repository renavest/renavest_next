'use client';

import { TrendingUp, Users, Zap, AlertCircle } from 'lucide-react';
import { useState } from 'react';

import CreditRequestsModal from '@/src/features/employer-dashboard/components/CreditRequestsModal';
import {
  employeeMetricsSignal,
  programStatsSignal,
  sessionMetricsSignal,
} from '@/src/features/employer-dashboard/state/employerDashboardState';

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
        <div className='flex flex-row gap-6'>
          {/* Platform Engagement Card */}
          <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg w-[320px] relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full -mr-8 -mt-8 opacity-50'></div>
            <div className='relative z-10'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg'>
                  <Users className='w-5 h-5 text-white' />
                </div>
                <div>
                  <p className='text-sm font-medium text-green-600 uppercase tracking-wide'>
                    PLATFORM ENGAGEMENT
                  </p>
                  <p className='text-gray-600 text-sm'>Employees actively using our platform</p>
                </div>
              </div>

              <div className='mb-4'>
                <div className='flex items-baseline gap-2 mb-2'>
                  <span className='text-3xl font-bold text-green-700'>{platformAdoption}%</span>
                  <div className='flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full'>
                    <TrendingUp className='w-3 h-3 text-green-600' />
                    <span className='text-xs font-medium text-green-600'>+12%</span>
                  </div>
                </div>
                <p className='text-green-600 text-sm font-medium'>
                  {employeeMetricsSignal.value.activeInProgram} of {stats.totalEmployees} employees
                  enrolled
                </p>
              </div>

              <div className='bg-white rounded-lg p-3 border border-green-100'>
                <p className='text-xs text-gray-500 mb-1'>IMPACT HIGHLIGHT</p>
                <p className='text-sm font-semibold text-gray-700'>
                  86% report improved work-life balance
                </p>
              </div>
            </div>
          </div>

          {/* Credit Requests Card */}
          <div
            onClick={() => setIsModalOpen(true)}
            className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-lg w-[320px] cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 relative overflow-hidden'
          >
            <div className='absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full -mr-8 -mt-8 opacity-50'></div>
            <div className='relative z-10'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg'>
                  <Zap className='w-5 h-5 text-white' />
                </div>
                <div>
                  <p className='text-sm font-medium text-amber-600 uppercase tracking-wide'>
                    HIGH DEMAND ALERT
                  </p>
                  <p className='text-gray-600 text-sm'>Employees requesting additional sessions</p>
                </div>
              </div>

              <div className='mb-4'>
                <div className='flex items-baseline gap-2 mb-2'>
                  <span className='text-3xl font-bold text-amber-700'>
                    {sessionMetrics.employeesRequestingTopUp}
                  </span>
                  <div className='flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full'>
                    <AlertCircle className='w-3 h-3 text-amber-600' />
                    <span className='text-xs font-medium text-amber-600'>Urgent</span>
                  </div>
                </div>
                <p className='text-amber-600 text-sm font-medium'>
                  Employees want more therapy credits
                </p>
              </div>

              <div className='bg-white rounded-lg p-3 border border-amber-100'>
                <p className='text-xs text-gray-500 mb-1'>SUCCESS INDICATOR</p>
                <p className='text-sm font-semibold text-gray-700'>
                  High engagement shows program value
                </p>
              </div>
            </div>
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
