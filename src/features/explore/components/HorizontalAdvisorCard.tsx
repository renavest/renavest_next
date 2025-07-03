'use client';
import { ChevronDown, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { useImageLoadState } from '../hooks/useImageLoadState';
import { advisorActions } from '../state/exploreState';
import { Advisor } from '../types';

interface AdvisorCardProps {
  advisor: Advisor;
  priority: boolean;
}

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='border-t border-gray-200'>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className='flex justify-between items-center w-full py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none'
      >
        <span>{question}</span>
        <ChevronDown
          className={cn('w-5 h-5 transition-transform', {
            'transform rotate-180': isOpen,
          })}
        />
      </button>
      {isOpen && (
        <div className='pb-3 px-2 text-sm text-gray-600'>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const VerticalAdvisorCard: React.FC<AdvisorCardProps> = ({ advisor, priority }) => {
  const { imageLoadState, handleImageLoad, handleImageError } = useImageLoadState(advisor.id);
  const expertiseTags = advisor.expertise?.split(',') || [];

  const handleClick = () => {
    advisorActions.openAdvisorModal(advisor);
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl flex flex-col mb-4 p-4 transition-all duration-300 bg-white border border-gray-200 hover:border-purple-300 hover:shadow-lg',
      )}
    >
      {/* Image Section */}
      <div
        className='group relative aspect-square w-full overflow-hidden rounded-xl cursor-pointer mb-4'
        onClick={handleClick}
      >
        {imageLoadState.isLoading && !imageLoadState.hasError && (
          <div className='absolute inset-0 bg-gray-100 rounded-2xl flex items-center justify-center z-10'>
            <div className='flex flex-col items-center space-y-2'>
              <div className='w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin'></div>
            </div>
          </div>
        )}
        <Image
          src={
            imageLoadState.hasError ? '/experts/placeholderexp.png' : (advisor.profileUrl as string)
          }
          alt={advisor.name}
          fill
          className={cn(
            'rounded-2xl object-cover object-center transition-all duration-500 group-hover:scale-110',
            imageLoadState.isLoaded ? 'opacity-100' : 'opacity-0',
            'bg-gray-100',
            'overflow-hidden',
          )}
          sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw'
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority={priority}
          style={{ backgroundColor: '#f3f4f6' }}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70 group-hover:opacity-90 transition-opacity'></div>
        <div className='absolute bottom-2 left-2 text-white p-2'>
          <h3 className='font-bold text-lg'>{advisor.name}</h3>
          <p className='text-sm'>{advisor.title}</p>
        </div>
      </div>

      {/* Details Section */}
      <div className='flex-1 flex flex-col'>
        <div className='flex-1'>
          <p className='text-sm text-gray-600 mt-2'>{advisor.previewBlurb || advisor.longBio}</p>
          <div className='mt-3 flex items-start flex-wrap gap-1.5'>
            {expertiseTags.slice(0, 4).map((exp, index) => (
              <span
                key={index}
                className={cn(
                  'px-2 py-1 rounded-full text-xs tracking-wide',
                  COLORS.WARM_PURPLE['10'],
                  'text-purple-700',
                )}
              >
                {exp.trim()}
              </span>
            ))}
          </div>

          <div className='mt-4'>
            <FAQItem
              question='What is your philosophy on financial therapy?'
              answer='I believe in empowering clients to build a healthy and positive relationship with their finances through personalized strategies.'
            />
            <FAQItem
              question='What can I expect in a first session?'
              answer="Our first session is a chance for us to get to know each other. We'll discuss your goals and I'll answer any questions you have."
            />
          </div>
        </div>

        <div className='mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-3'>
          <button
            onClick={handleClick}
            className='px-4 py-2 text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors'
          >
            View Profile
          </button>
          <button
            onClick={() => {}}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors',
              COLORS.WARM_PURPLE.bg,
              COLORS.WARM_PURPLE.hover,
            )}
          >
            <MessageSquare className='w-4 h-4' />
            Start a Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerticalAdvisorCard;
