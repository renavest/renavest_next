'use client';

import { COLORS } from '@/src/styles/colors';

import { isScriptExpandedSignal, weeklyMoneyScript } from '../../state/dashboardState';

export default function WeeklyMoneyScript() {
  const toggleExpanded = () => {
    isScriptExpandedSignal.value = !isScriptExpandedSignal.value;
  };

  return (
    <div
      onClick={toggleExpanded}
      className='bg-white rounded-xl p-4 md:p-8 border border-gray-100 shadow-sm cursor-pointer transition-all hover:bg-gray-50'
    >
      <div className='flex items-center justify-between mb-4 md:mb-6'>
        <h3 className={`text-lg md:text-2xl font-semibold ${COLORS.WARM_PURPLE.DEFAULT}`}>
          Your Money Script
        </h3>
        <span className='text-xs md:text-sm text-gray-500'>Week of {weeklyMoneyScript.weekOf}</span>
      </div>
      <p
        className={`text-base md:text-xl leading-relaxed text-gray-700 transition-all duration-300
          ${isScriptExpandedSignal.value ? 'line-clamp-none' : 'line-clamp-3'}`}
      >
        {weeklyMoneyScript.message}
      </p>
    </div>
  );
}
