'use client';
import { Calendar } from 'lucide-react';
import Image from 'next/image';

import { therapists } from '../../state/dashboardState';

export default function TherapistConnection() {
  const currentTherapist = therapists.find((t) => t.name === 'Dr. Sarah Chen')!;

  return (
    <div className='bg-white rounded-xl p-6 border border-[#952e8f]/20 shadow-sm'>
      <div className='flex items-center gap-4 mb-6'>
        <div className='flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#952e8f]/20'>
          <Image
            src={currentTherapist.imageUrl}
            alt={currentTherapist.name}
            width={48}
            height={48}
            className='rounded-full object-cover'
          />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-[#952e8f]'>{currentTherapist.name}</h3>
          <p className='text-sm text-gray-600'>Your Financial Therapist</p>
        </div>
      </div>

      <p className='text-gray-800 mb-6'>
        Based on your recent spending patterns, it might be helpful to discuss budgeting strategies
        with your financial therapist.
      </p>

      <div className='flex items-center gap-2 text-gray-600 mb-4'>
        <Calendar className='h-5 w-5 text-[#952e8f]' />
        <span>Your next scheduled session: Wednesday, 2:00 PM</span>
      </div>

      <button className='px-4 py-2 bg-[#952e8f] text-white rounded-md hover:bg-[#952e8f]/90 transition font-medium'>
        Schedule Session
      </button>
    </div>
  );
}
