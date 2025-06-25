// src/features/auth/components/onboarding/MaritalStatus.tsx
'use client';

import React from 'react'; // Import React

import { cn } from '@/src/lib/utils';

// Removed direct signal import, use global signal instead
import { firstName, selectedMaritalStatus, currentStep } from '../../state/authState';
import { OnboardingStep } from '../../types';

const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'domestic_partnership', label: 'Domestic Partnership' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function MaritalStatusStep() {
  const handleMaritalStatusSelect = (maritalStatus: string) => {
    selectedMaritalStatus.value = maritalStatus;
  };
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaritalStatus.value) {
      currentStep.value = OnboardingStep.ETHNICITY;
    }
  };
  const handleBack = () => {
    currentStep.value = OnboardingStep.AGE_RANGE;
  };
  const handleBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };
  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
          What's your marital status, {firstName.value}?
        </h2>
      </div>
      <form onSubmit={handleContinue} className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {MARITAL_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type='button'
              onClick={() => handleMaritalStatusSelect(option.value)}
              className={cn(
                'w-full p-4 rounded-xl text-left transition-all duration-300 ease-out',
                'hover:shadow-md hover:-translate-y-0.5',
                'flex items-center justify-center text-center border-2',
                selectedMaritalStatus.value === option.value
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
            type='submit'
            className={cn(
              'py-3 px-6 rounded-full shadow-md text-sm font-medium text-white',
              'transition-all duration-300 ease-in-out transform',
              selectedMaritalStatus.value
                ? 'bg-black hover:bg-gray-800'
                : 'bg-gray-300 cursor-not-allowed',
            )}
            disabled={!selectedMaritalStatus.value}
          >
            Continue
          </button>
        </div>
      </form>
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
