'use client';

import { Advisor } from '@/src/shared/types';

import { isOpenSignal, advisorSignal } from '../state/advisorSignals';

interface AdvisorGridProps {
  advisors: Advisor[];
}

export default function AdvisorGrid({ advisors }: AdvisorGridProps) {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
        {advisors.map((advisor) => (
          <div
            key={advisor.id}
            className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer'
            onClick={() => {
              advisorSignal.value = advisor;
              isOpenSignal.value = true;
            }}
          >
            <div className='flex items-start gap-4'>
              <img
                src={advisor.profileUrl || '/experts/placeholderexp.png'}
                alt={advisor.name}
                className='h-16 w-16 rounded-lg object-cover'
              />
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>{advisor.name}</h3>
                <p className='text-sm text-gray-500'>{advisor.title}</p>
                <p className='text-sm text-gray-500'>{advisor.yoe} years of experience</p>
              </div>
            </div>

            <p className='mt-4 text-gray-600 line-clamp-2'>{advisor.previewBlurb}</p>

            <div className='mt-4'>
              <div className='flex flex-wrap gap-2'>
                {advisor.expertise?.split(',').slice(0, 3).map((exp, index) => (
                  <span
                    key={index}
                    className='px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs'
                  >
                    {exp.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 