'use client';

import { cn } from '@/src/lib/utils';

import { firstName, selectedAgeRange, currentStep } from '../../state/authState';
import { OnboardingStep } from '../../types';

const AGE_RANGE_OPTIONS = [
  { value: '18_24', label: '18-24' },
  { value: '25_34', label: '25-34' },
  { value: '35_44', label: '35-44' },
  { value: '45_54', label: '45-54' },
  { value: '55_64', label: '55-64' },
  { value: '65_plus', label: '65+' },
];

export function AgeRangeStep() {
  const handleAgeRangeSelect = (ageRange: string) => {
    selectedAgeRange.value = ageRange;
  };
  const handleContinue = () => {
    if (selectedAgeRange.value) {
      currentStep.value = OnboardingStep.MARITAL_STATUS;
    }
  };
  const handleBack = () => {
    currentStep.value = OnboardingStep.PURPOSE;
  };
  const handleBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };
  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
          Hi {firstName.value}, what's your age range?
        </h2>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {AGE_RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type='button'
            onClick={() => handleAgeRangeSelect(option.value)}
            className={cn(
              'w-full p-4 rounded-xl text-left transition-all duration-300 ease-out',
              'hover:shadow-md hover:-translate-y-0.5',
              'flex items-center justify-center text-center border-2',
              selectedAgeRange.value === option.value
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-900 border-gray-200 hover:border-black',
            )}
          >
            <span className='font-medium'>{option.label}</span>
          </button>
        ))}
      </div>
      <div className='flex justify-between items-center mt-6'>
        <button
          type='button'
          onClick={handleBack}
          className='p-2 text-gray-600 hover:text-gray-900'
        >
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
          onClick={handleContinue}
          className={cn(
            'py-3 px-6 rounded-full shadow-md text-sm font-medium text-white',
            'transition-all duration-300 ease-in-out transform',
            selectedAgeRange.value
              ? 'bg-black hover:bg-gray-800'
              : 'bg-gray-300 cursor-not-allowed',
          )}
          disabled={!selectedAgeRange.value}
        >
          Continue
        </button>
      </div>
      <div className='text-center mt-4'>
        <p className='text-sm text-gray-600'>
          Have an account?{' '}
          <button
            type='button'
            onClick={handleBackToLogin}
            className='text-gray-900 hover:underline font-medium'
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
