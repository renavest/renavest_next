'use client';
import { COLORS } from '@/src/styles/colors';

import { actionableInsights } from '../../state/dashboardState';

export default function ActionableInsights() {
  return (
    <div className='space-y-3'>
      {actionableInsights.map((insight) => (
        <div
          key={insight.id}
          className='bg-white rounded-lg p-3 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200'
        >
          <p className='text-xs md:text-sm text-gray-500 mb-1.5 md:mb-2'>
            <span>{insight.message.prefix}</span>
            <span className='font-medium text-gray-700'>{insight.message.amount}</span>
            <span>{insight.message.suffix}</span>
          </p>
          <p className='text-sm md:text-base text-gray-700'>
            <span>{insight.impact.prefix}</span>
            <span className={`font-semibold ${COLORS.WARM_PURPLE.DEFAULT}`}>
              {insight.impact.amount}
            </span>
            <span>{insight.impact.suffix}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
