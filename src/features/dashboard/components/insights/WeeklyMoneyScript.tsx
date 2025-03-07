'use client';

import { isScriptExpandedSignal, weeklyMoneyScript } from '../../state/dashboardState';

export default function WeeklyMoneyScript() {
  const toggleExpanded = () => {
    isScriptExpandedSignal.value = !isScriptExpandedSignal.value;
  };

  return (
    <div
      onClick={toggleExpanded}
      className='bg-white rounded-xl p-8 border border-gray-100 shadow-sm cursor-pointer transition-all hover:bg-gray-50'
    >
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-2xl font-semibold text-[#952e8f]'>Your Money Script</h3>
        <span className='text-sm text-gray-500'>Week of {weeklyMoneyScript.weekOf}</span>
      </div>
      <p
        className={`text-xl leading-relaxed text-gray-700 transition-all duration-300
          ${isScriptExpandedSignal.value ? 'line-clamp-none' : 'line-clamp-3'}`}
      >
        {weeklyMoneyScript.message}
      </p>
    </div>
  );
}
