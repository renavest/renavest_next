'use client';
import { Calendar } from 'lucide-react';
import Image from 'next/image';

import { therapists } from '../../state/dashboardState';

export default function TherapistConnection() {
  const currentTherapist = therapists.find((t) => t.name === 'Dr. Sarah Chen')!;

  return (
    <div className='bg-white rounded-xl p-4 md:p-6 border border-[#952e8f]/20 shadow-sm'>
      <div className='flex items-center gap-3 md:gap-4 mb-4 md:mb-6'>
        <div className='flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#952e8f]/20'>
          <Image
            src={currentTherapist.imageUrl}
            alt={currentTherapist.name}
            width={48}
            height={48}
            className='rounded-full object-cover w-full h-full'
          />
        </div>
        <div>
          <h3 className='text-base md:text-lg font-semibold text-[#952e8f]'>
            {currentTherapist.name}
          </h3>
          <p className='text-xs md:text-sm text-gray-600'>Your Financial Therapist</p>
        </div>
      </div>

      <p className='text-sm md:text-base text-gray-800 mb-4 md:mb-6'>
        Based on your recent spending patterns, it might be helpful to discuss budgeting strategies
        with your financial therapist.
      </p>

      <div className='flex items-center gap-2 text-xs md:text-sm text-gray-600 mb-3 md:mb-4'>
        <Calendar className='h-4 w-4 md:h-5 md:w-5 text-[#952e8f]' />
        <span>Your next scheduled session: Wednesday, 2:00 PM</span>
      </div>

      <button className='w-full md:w-auto px-4 py-2 bg-[#952e8f] text-white rounded-md hover:bg-[#952e8f]/90 transition font-medium text-sm md:text-base'>
        Schedule Session
      </button>
    </div>
  );
}
