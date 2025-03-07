'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { therapists } from '../../state/dashboardState';

export default function ExploreTherapists() {
  // Filter out current therapist (Dr. Sarah Chen)
  const otherTherapists = therapists.filter((t) => t.name !== 'Dr. Sarah Chen').slice(0, 2);

  return (
    <div className='bg-white rounded-xl p-8 border border-gray-100 shadow-sm'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-2xl font-semibold text-gray-800'>Explore More Experts</h3>
        <Link
          href='/'
          className='text-[#952e8f] hover:text-[#952e8f]/80 font-medium flex items-center gap-1'
        >
          View All
          <ArrowRight className='h-4 w-4' />
        </Link>
      </div>

      <div className='space-y-6'>
        {otherTherapists.map((therapist) => (
          <div
            key={therapist.id}
            className='flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors'
          >
            <div className='flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#952e8f]/20'>
              <Image
                src={therapist.imageUrl}
                alt={therapist.name}
                width={48}
                height={48}
                className='rounded-full object-cover'
              />
            </div>
            <div className='flex-1 min-w-0'>
              <h4 className='font-medium text-gray-900 truncate'>{therapist.name}</h4>
              <p className='text-sm text-gray-500'>{therapist.specialty}</p>
            </div>
            <div className='text-right flex-shrink-0'>
              <div className='text-sm font-medium text-[#952e8f] mb-1'>
                {therapist.matchScore}% Match
              </div>
              <div className='text-xs text-gray-500'>Next: {therapist.nextAvailable}</div>
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
