'use client';
import { Calendar } from 'lucide-react';

export default function TherapistConnection() {
  return (
    <div className='bg-white rounded-xl p-6 border border-[#952e8f]/20 shadow-sm'>
      <h3 className='text-xl font-semibold text-[#952e8f] mb-4'>Therapist Connection</h3>

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
