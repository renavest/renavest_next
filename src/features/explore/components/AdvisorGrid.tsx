'use client';
import { Award } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import OnboardingModalServerWrapper from '../../onboarding/components/OnboardingModalServerWrapper';
import { useImageLoadState } from '../hooks/useImageLoadState';
import { advisorActions } from '../state/exploreState';
import { Advisor } from '../types';

import AdvisorModal from './AdvisorModal';

interface AdvisorCardProps {
  advisor: Advisor;
  priority: boolean;
}

// Import the hook from the new location

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

const AdvisorCard: React.FC<AdvisorCardProps> = ({ advisor, priority }) => {
  const { imageLoadState, handleImageLoad, handleImageError } = useImageLoadState(advisor.id);

  // Limit expertise tags and add ellipsis if more exist
  const expertiseTags = advisor.expertise?.split(',') || [];

  const handleClick = () => {
    advisorActions.openAdvisorModal(advisor);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative rounded-2xl flex flex-col mb-4 p-2 sm:p-4 transition-all duration-300 cursor-pointer',
        'hover:bg-purple-50',
      )}
    >
      <div className='group relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden'>
        {/* Loading spinner - show when loading and no error */}
        {imageLoadState.isLoading && !imageLoadState.hasError && (
          <div className='absolute inset-0 bg-gray-100 rounded-2xl flex items-center justify-center z-10'>
            <div className='flex flex-col items-center space-y-2'>
              <div className='w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin'></div>
              <span className='text-xs text-gray-500 font-medium'>Loading...</span>
            </div>
          </div>
        )}

        {/* Main image */}
        <Image
          src={
            imageLoadState.hasError ? '/experts/placeholderexp.png' : (advisor.profileUrl as string)
          }
          alt={advisor.name}
          fill
          className={cn(
            'rounded-2xl object-cover object-center transition-all duration-500',
            'group-hover:scale-110',
            // Smooth opacity transition based on loading state
            imageLoadState.isLoaded ? 'opacity-100' : 'opacity-0',
            // Ensure no background shows through during loading
            'bg-gray-100',
            'overflow-hidden',
          )}
          sizes='(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 280px, 320px'
          onLoad={handleImageLoad}
          onError={handleImageError}
          placeholder='blur'
          blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
          quality={85}
          priority={priority}
          style={{
            backgroundColor: '#f3f4f6', // gray-100 fallback
          }}
        />

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
                    {advisor.hourlyRate} / hr
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
  // Set advisors in global state when component receives them
  React.useEffect(() => {
    if (advisors.length > 0) {
      advisorActions.setAdvisors(advisors);
    }
  }, [advisors]);

  return (
    <OnboardingModalServerWrapper>
      <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8'>
          {advisors.map((advisor, index) => (
            <AdvisorCard
              key={advisor.id}
              advisor={advisor}
              priority={index < 3} // Priority load first 3 images
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
