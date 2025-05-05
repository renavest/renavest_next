'use client';

import EngagementChart from '@/src/features/employer-dashboard/components/EngagementChart';
import LoginFrequencyChart from '@/src/features/employer-dashboard/components/LoginFrequencyChart';

export function ChartsSections() {
  return (
    <div className='space-y-8'>
      {/* Main Charts (Sessions & Login Activity) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <LoginFrequencyChart />
        <EngagementChart />
      </div>
    </div>
  );
}
