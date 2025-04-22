'use client';
import { Award } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { cn } from '@/src/lib/utils';
import { Advisor } from '@/src/shared/types';
import { COLORS } from '@/src/styles/colors';

import OnboardingModalServerWrapper from '../../onboarding/components/OnboardingModalServerWrapper';
import { advisorSignal, isOpenSignal } from '../state/advisorSignals';

import AdvisorModal from './AdvisorModal';

interface AdvisorCardProps {
  advisor: Advisor;
  onClick: () => void;
}

const useImageLoadState = () => {
  const [imageLoadState, setImageLoadState] = useState({
    isLoaded: false,
    hasError: false,
  });

  const handleImageLoad = () => {
    setImageLoadState({
      isLoaded: true,
      hasError: false,
    });
  };

  const handleImageError = () => {
    setImageLoadState({
      isLoaded: false,
      hasError: true,
    });
  };

  return { imageLoadState, handleImageLoad, handleImageError };
};

const renderExpertiseTags = (expertiseTags: string[]) => {
  return (
    <div className='mt-2 flex items-start flex-wrap gap-1 sm:gap-1.5 min-h-[1.5rem] sm:min-h-[2rem] overflow-hidden'>
      {expertiseTags.slice(0, 3).map((exp, index) => (
        <span
          key={index}
          className={cn(
            'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs tracking-wide',
            COLORS.WARM_PURPLE['10'],
            'text-purple-700',
          )}
        >
          {exp.trim()}
        </span>
      ))}
      {expertiseTags.length > 3 && (
        <span
          className={cn(
            'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs tracking-wide',
            COLORS.WARM_PURPLE['10'],
            'text-purple-700',
          )}
        >
          +{expertiseTags.length - 3}
        </span>
      )}
    </div>
  );
};

const AdvisorCard: React.FC<AdvisorCardProps> = ({ advisor, onClick }) => {
  const { imageLoadState, handleImageLoad, handleImageError } = useImageLoadState();

  // Limit expertise tags and add ellipsis if more exist
  const expertiseTags = advisor.expertise?.split(',') || [];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl flex flex-col mb-4 p-2 sm:p-4 transition-all duration-300 cursor-pointer',
        'hover:bg-purple-50',
      )}
    >
      <div className='group relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden'>
        {!imageLoadState.isLoaded && !imageLoadState.hasError && (
          <div
            className='absolute inset-0 bg-gray-200 animate-pulse'
            aria-label='Image loading placeholder'
          />
        )}

        {imageLoadState.hasError ? (
          <Image
            width={350}
            height={350}
            src={'/experts/placeholderexp.png'}
            alt={advisor.name}
            className={cn(
              'h-full w-full rounded-2xl object-cover object-center transition-transform duration-500',
              'group-hover:scale-110',
              'opacity-100',
              'overflow-hidden',
            )}
            placeholder='blur'
            blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          />
        ) : (
          <Image
            width={350}
            height={350}
            src={advisor.profileUrl as string}
            alt={advisor.name}
            className={cn(
              'h-full w-full rounded-2xl object-cover object-center transition-transform duration-500',
              'group-hover:scale-110',
              !imageLoadState.isLoaded ? 'opacity-0' : 'opacity-100',
              'overflow-hidden',
            )}
            placeholder='blur'
            blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
            onLoadingComplete={handleImageLoad}
            onError={handleImageError}
          />
        )}

        <div className='absolute top-2 sm:top-4 left-2 sm:left-4 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-medium tracking-wide text-gray-700 shadow-sm'>
          {advisor.yoe} years of experience
        </div>
      </div>

      <div className='p-2 sm:p-4 flex-1 flex flex-col'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='font-semibold text-gray-900 tracking-wide text-base sm:text-lg'>
                {advisor.name}
              </h3>
              {advisor.hourlyRate && (
                <>
                  <span className='text-gray-300 text-xs'>•</span>
                  <span className='text-xs sm:text-sm font-semibold text-purple-600'>
                    {advisor.hourlyRate}/hr
                  </span>
                </>
              )}
            </div>
            <p className='text-xs sm:text-sm text-gray-600 mt-0.5 flex items-center tracking-wide'>
              <Award className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
              {advisor.title}
            </p>
          </div>
        </div>
        {renderExpertiseTags(expertiseTags)}
        <p className='mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 tracking-wide line-clamp-2 sm:line-clamp-3'>
          {advisor.previewBlurb || advisor.introduction}
        </p>
      </div>
    </div>
  );
};

const AdvisorGrid: React.FC<{ advisors: Advisor[] }> = ({ advisors }) => {
  // Update the signals when an advisor is clicked.
  const handleAdvisorClick = (advisor: Advisor) => {
    advisorSignal.value = advisor;
    isOpenSignal.value = true;
  };

  return (
    <OnboardingModalServerWrapper>
      <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8'>
          {advisors.map((advisor) => (
            <AdvisorCard
              key={advisor.id}
              advisor={advisor}
              onClick={() => handleAdvisorClick(advisor)}
            />
          ))}
        </div>

        {/* The AdvisorPopover now reads its state from signals */}
        <AdvisorModal />
      </div>
    </OnboardingModalServerWrapper>
  );
};

export default AdvisorGrid;
