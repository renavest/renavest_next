'use client';

import { cn } from '@/src/lib/utils';

// Define interest options
const INTEREST_OPTIONS = [
  {
    value: 'design',
    label: 'Design',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M12 19c.5 0 1-.1 1.4-.4.6-.4.6-1 .6-1.6 0-.4-.1-.7-.2-1-.1-.3-.3-.6-.5-.9-.2-.3-.3-.5-.4-.8-.1-.2-.1-.5-.1-.7 0-.7.3-1.3.8-1.8.5-.5 1.1-.8 1.8-.8.5 0 1 .1 1.4.4.6.4.6 1 .6 1.6 0 .4-.1.7-.2 1-.1.3-.3.6-.5.9-.2.3-.3.5-.4.8-.1.2-.1.5-.1.7 0 .7.3 1.3.8 1.8.5.5 1.1.8 1.8.8' />
        <path d='M19 3h-4.2C13.8 3 13 3.8 13 4.8V5h7v-.2c0-1-.8-1.8-1.8-1.8Z' />
        <path d='M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2' />
      </svg>
    ),
  },
  {
    value: 'engineering',
    label: 'Engineering',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='m18 16 4-4-4-4' />
        <path d='m6 8-4 4 4 4' />
        <path d='m14.5 4-5 16' />
      </svg>
    ),
  },
  {
    value: 'product',
    label: 'Product',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='m2 16 6-6 4 4 8-8' />
        <path d='m22 6-4 4' />
        <path d='M6 12 2 8' />
        <path d='M18 18 8 8' />
      </svg>
    ),
  },
  {
    value: 'marketing',
    label: 'Marketing',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M21.2 8.4c.5.38.8.96.8 1.6 0 1.1-.9 2-2 2H6l-4 4V4c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v4.4Z' />
      </svg>
    ),
  },
  {
    value: 'web3',
    label: 'Web3',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z' />
        <path d='M12 6v12' />
        <path d='M6 12h12' />
      </svg>
    ),
  },
  {
    value: 'freelancing',
    label: 'Freelancing',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <rect width='20' height='14' x='2' y='7' rx='2' ry='2' />
        <path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' />
      </svg>
    ),
  },
  {
    value: 'career_advice',
    label: 'Career advice',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5' />
        <path d='M9 18h6' />
        <path d='M10 22h4' />
      </svg>
    ),
  },
  {
    value: 'mentorship',
    label: 'Mentorship',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M8 17a5 5 0 0 1 5 5v0a5 5 0 0 1 5-5' />
        <path d='M13 7a5 5 0 0 0-5-5c0 2.76-2.5 5-5 5 2.5 0 5 2.24 5 5a5 5 0 0 0 5-5Z' />
        <path d='M13 7a5 5 0 0 1 5-5c0 2.76 2.5 5 5 5-2.5 0-5 2.24-5 5a5 5 0 0 1-5-5Z' />
      </svg>
    ),
  },
  {
    value: 'mentoring',
    label: 'Mentoring',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z' />
        <circle cx='16.5' cy='7.5' r='.5' />
      </svg>
    ),
  },
];

interface InterestsStepProps {
  selectedInterests: string[];
  onInterestSelect: (interest: string) => void;
  onContinue: () => void;
  onBack: () => void;
  firstName: string;
}

export function InterestsStep({
  selectedInterests,
  onInterestSelect,
  onContinue,
  onBack,
  firstName,
}: InterestsStepProps) {
  return (
    <div className='space-y-6'>
      {/* Logo Section */}
      <div className='flex flex-col items-center'>
        <div className='flex items-center mb-4'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2'
          >
            <circle cx='12' cy='12' r='10' />
            <circle cx='12' cy='12' r='4' />
            <line x1='4.93' y1='4.93' x2='9.17' y2='9.17' />
            <line x1='14.83' y1='14.83' x2='19.07' y2='19.07' />
            <line x1='14.83' y1='9.17' x2='19.07' y2='4.93' />
            <line x1='4.93' y1='19.07' x2='9.17' y2='14.83' />
          </svg>
          <span className='text-2xl font-bold'>Braintrust</span>
        </div>
      </div>

      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
          Great to meet you, {firstName}
        </h2>
        <div className='text-xl text-gray-900 text-center'>What are you interested in?</div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
        {INTEREST_OPTIONS.map((option) => (
          <button
            key={option.value}
            type='button'
            onClick={() => onInterestSelect(option.value)}
            className={cn(
              'p-4 rounded-xl text-left transition-all duration-300 ease-out',
              'hover:shadow-md hover:-translate-y-0.5',
              'flex flex-col items-center justify-center text-center min-h-[140px]',
              selectedInterests.includes(option.value)
                ? 'bg-purple-50 border-2 border-purple-200'
                : 'bg-white border-2 border-gray-100 hover:border-purple-200',
            )}
            style={{
              backgroundColor: selectedInterests.includes(option.value) ? '#f7f5ff' : 'white',
            }}
          >
            <div className='mb-3 text-gray-500'>{option.icon}</div>
            <span className='font-medium'>{option.label}</span>
          </button>
        ))}
      </div>

      <div className='flex justify-between mt-6'>
        <button type='button' onClick={onBack} className='p-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M19 12H5' />
            <path d='M12 19l-7-7 7-7' />
          </svg>
        </button>
        <button
          type='button'
          onClick={onContinue}
          className={cn(
            'py-3 px-6 rounded-full shadow-md text-sm font-medium text-white',
            'transition-all duration-300 ease-in-out transform',
            selectedInterests.length > 0
              ? 'bg-black hover:bg-gray-800'
              : 'bg-gray-300 cursor-not-allowed',
          )}
          disabled={selectedInterests.length === 0}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
