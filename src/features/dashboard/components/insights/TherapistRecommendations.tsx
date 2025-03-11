'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { COLORS } from '@/src/styles/colors';

import { therapists } from '../../state/dashboardState';

export default function ExploreTherapists() {
  // Filter out current therapist (Dr. Sarah Chen)
  const otherTherapists = therapists.filter((t) => t.name !== 'Dr. Sarah Chen').slice(0, 2);

  return (
    <div className='bg-white rounded-xl p-4 md:p-8 border border-gray-100 shadow-sm'>
      <div className='flex items-center justify-between mb-4 md:mb-6'>
        <h3 className='text-lg md:text-2xl font-semibold text-gray-800'>Explore More Experts</h3>
        <Link
          href='/'
          className={`${COLORS.WARM_PURPLE.DEFAULT} hover:opacity-80 font-medium flex items-center gap-1 text-sm md:text-base`}
        >
          View All
          <ArrowRight className='h-3 w-3 md:h-4 md:w-4' />
        </Link>
      </div>

      <div className='space-y-4'>
        {otherTherapists.map((therapist) => (
          <div
            key={therapist.id}
            className='p-3 md:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
          >
            <div className='flex items-center gap-3 md:gap-4'>
              <div className='flex-shrink-0 w-10 h-10 md:w-12 md:h-12'>
                <Image
                  src={therapist.imageUrl}
                  alt={therapist.name}
                  width={48}
                  height={48}
                  className='rounded-full object-cover w-full h-full'
                />
              </div>
              <div className='flex-1 min-w-0'>
                <h4 className='text-base md:text-lg font-medium text-gray-800 truncate'>
                  {therapist.name}
                </h4>
                <p className='text-xs md:text-sm text-gray-500'>{therapist.specialty}</p>
                <div className='flex items-center gap-2 mt-1'>
                  <span className='text-xs md:text-sm text-gray-600'>Next available:</span>
                  <span className={`text-xs md:text-sm font-medium ${COLORS.WARM_PURPLE.DEFAULT}`}>
                    {therapist.nextAvailable}
                  </span>
                </div>
              </div>
              <div className='flex flex-col items-end'>
                <span className={`text-xs md:text-sm font-medium ${COLORS.WARM_PURPLE.DEFAULT}`}>
                  {therapist.matchScore}% match
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className='mt-6 text-sm text-gray-500 text-center'>
        Find the perfect financial therapist for your unique journey
      </p>
    </div>
  );
}
