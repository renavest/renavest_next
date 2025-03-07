'use client';

import { weeklyMoneyScript } from '../../state/dashboardState';

export default function WeeklyMoneyScript() {
  return (
    <div className='bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 border border-[#952e8f]/20'>
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#952e8f]/20'>
          {/* <User className='h-6 w-6 text-purple-600' /> */}
          <img
            src='https://randomuser.me/api/portraits/women/81.jpg'
            alt='logo'
            className='rounded-full object-cover'
          />
        </div>

        <div>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='font-medium text-lg text-[#952e8f]'>{weeklyMoneyScript.author}</h3>
            {/* <span className='text-sm text-purple-700'>Your Financial Therapist</span> */}
          </div>

          <span className='text-sm text-[#952e8f]/70'>Week of {weeklyMoneyScript.weekOf}</span>

          <p className='mt-4 text-lg leading-relaxed text-gray-800'>{weeklyMoneyScript.message}</p>
        </div>
      </div>
    </div>
  );
}
