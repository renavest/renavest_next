'use client';
import { actionableInsights } from '../../state/dashboardState';

export default function ActionableInsights() {
  return (
    <div className='space-y-3'>
      {actionableInsights.map((insight) => (
        <div key={insight.id} className='bg-white rounded-lg p-4 border border-gray-100 shadow-sm'>
          <p className='text-sm text-gray-500 mb-2'>
            <span>{insight.message.prefix}</span>
            <span className='font-medium text-gray-700'>{insight.message.amount}</span>
            <span>{insight.message.suffix}</span>
          </p>
          <p className='text-gray-700'>
            <span>{insight.impact.prefix}</span>
            <span className='font-semibold text-[#952e8f]'>{insight.impact.amount}</span>
            <span>{insight.impact.suffix}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
