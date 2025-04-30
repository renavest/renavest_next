'use client';

import LoginFrequencyChart from '@/src/features/employer-dashboard/components/LoginFrequencyChart';
import SessionsChart from '@/src/features/employer-dashboard/components/SessionsChart';

export function ChartsSections() {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      <LoginFrequencyChart />
      <SessionsChart />
    </div>
  );
}
