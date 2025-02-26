'use client';
import React from 'react';
import { Advisor } from '@/src/shared/types';
import { Award } from 'lucide-react';
import Image from 'next/image';
import { advisorSignal, isOpenSignal } from '../state/advisorSignals';
import AdvisorPopover from './AdvisorPopover';
interface AdvisorCardProps {
  advisor: Advisor;
  onClick: () => void;
}

const AdvisorCard: React.FC<AdvisorCardProps> = ({ advisor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className='relative rounded-2xl flex flex-col mb-4 p-4 hover:bg-[#ecc0ff] transition-all duration-300 cursor-pointer'
    >
      <div className='group relative aspect-[3/4] w-full overflow-hidden'>
        <Image
          width={350}
          height={350}
          src={advisor.profileUrl || '/experts/placeholderexp.png'}
          alt={advisor.name}
          className='h-full w-full rounded-2xl object-cover object-top transition-transform duration-500 group-hover:scale-110'
        />
        <div className='absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium tracking-wide text-gray-700 shadow-sm'>
          {advisor.yoe} years of experience
        </div>
      </div>
      <div className='p-4 flex-1 flex flex-col'>
        <div className='flex items-start justify-between'>
          <div>
            <h3 className='font-semibold text-gray-900 tracking-wide'>{advisor.name}</h3>
            <p className='text-sm text-gray-600 mt-0.5 flex items-center tracking-wide'>
              <Award className='w-4 h-4 mr-1' />
              {advisor.title}
            </p>
          </div>
        </div>
        <div className='mt-2 flex flex-wrap gap-1.5 max-h-16 overflow-hidden'>
          {advisor.expertise?.split(',')?.map((exp, index) => (
            <span
              key={index}
              className='px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full tracking-wide'
            >
              {exp.trim()}
            </span>
          ))}
        </div>
        <p className='mt-3 text-sm text-gray-600 tracking-wide line-clamp-3'>
          {advisor.previewBlurb || advisor.introduction}
        </p>
      </div>
    </div>
  );
};

const AdvisorGrid: React.FC<{ advisors: Advisor[] }> = ({ advisors }) => {
  // Update the signals when an advisor is clicked.
  const handleAdvisorClick = (advisor: Advisor) => {
    console.log('clicked advisor:', advisor);
    advisorSignal.value = advisor;
    isOpenSignal.value = true;
  };

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-8xl'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
        {advisors.map((advisor) => (
          <AdvisorCard
            key={advisor.id}
            advisor={advisor}
            onClick={() => handleAdvisorClick(advisor)}
          />
        ))}
      </div>

      {/* The AdvisorPopover now reads its state from signals */}
      <AdvisorPopover />
    </div>
  );
};

export default AdvisorGrid;
