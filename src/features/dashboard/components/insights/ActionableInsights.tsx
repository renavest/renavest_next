'use client';
import { ChartPieIcon, TrendingUpIcon } from 'lucide-react';

import { actionableInsights } from '../../state/dashboardState';

const iconMap = {
  spending: <ChartPieIcon className='h-5 w-5 text-[#952e8f]' />,
  behavior: <TrendingUpIcon className='h-5 w-5 text-[#952e8f]' />,
};

export default function ActionableInsights() {
  return (
    <div className='space-y-4'>
      {actionableInsights.map((insight) => (
        <div
          key={insight.id}
          className='bg-white rounded-lg p-6 border border-[#952e8f]/10 shadow-sm hover:shadow-md transition'
        >
          <div className='flex items-start gap-4'>
            <div className='flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center'>
              {iconMap[insight.category as keyof typeof iconMap]}
            </div>

            <div className='flex-1'>
              <p className='text-gray-800 text-lg mb-2'>{insight.message}</p>
              <p className='text-gray-600'>{insight.impact}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
