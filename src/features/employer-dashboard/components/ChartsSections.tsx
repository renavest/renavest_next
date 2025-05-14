'use client';

import EngagementChart from '@/src/features/employer-dashboard/components/EngagementChart';
import SessionAllocationChart from '@/src/features/employer-dashboard/components/SessionAllocationChart';

export function ChartsSections() {
  return (
    <div className='space-y-8'>
      {/* Main Charts (Sessions & Engagement) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <SessionAllocationChart />
        <EngagementChart />
      </div>
    </div>
  );
}
