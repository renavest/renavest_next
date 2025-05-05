'use client';

import EngagementTrendChart from '@/src/features/employer-dashboard/components/EngagementTrendChart';
import LoginFrequencyChart from '@/src/features/employer-dashboard/components/LoginFrequencyChart';
import SessionsChart from '@/src/features/employer-dashboard/components/SessionsChart';
import TeamPerformanceChart from '@/src/features/employer-dashboard/components/TeamPerformanceChart';

export function ChartsSections() {
  return (
    <div className='space-y-8'>
      {/* Main Charts (Sessions & Login Activity) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <LoginFrequencyChart />
        <SessionsChart />
      </div>

      {/* Additional Charts (Team Performance & Engagement Trends) */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <TeamPerformanceChart />
        <EngagementTrendChart />
      </div>
    </div>
  );
}
