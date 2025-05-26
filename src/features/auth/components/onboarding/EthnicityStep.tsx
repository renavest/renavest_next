// src/features/auth/components/onboarding/EthnicityStep.tsx
'use client';

import React from 'react';

import { cn } from '@/src/lib/utils';

import { selectedEthnicity, firstName, currentStep } from '../../state/authState';
import { OnboardingStep } from '../../types';

const ethnicityOptions = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Hispanic or Latino',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Two or More Races',
  'Middle Eastern or North African',
  'Other',
  'Prefer not to answer',
];

export function EthnicityStep() {
  const handleEthnicitySelect = (ethnicity: string) => {
    selectedEthnicity.value = ethnicity;
  };
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEthnicity.value) {
      currentStep.value = OnboardingStep.PRIVACY_PLEDGE;
    }
  };
  const handleBack = () => {
    currentStep.value = OnboardingStep.MARITAL_STATUS;
  };
  const handleBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };
  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
          What's your ethnicity, {firstName.value}?
        </h2>
        <p className='text-sm text-gray-600 text-center'>
          This information helps us better serve our diverse community. Your privacy is important to
          us.
        </p>
      </div>

      <form onSubmit={handleContinue} className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {ethnicityOptions.map((ethnicity) => (
            <button
              key={ethnicity}
              type='button'
              onClick={() => handleEthnicitySelect(ethnicity)}
              className={cn(
                'w-full p-4 rounded-xl text-left transition-all duration-300 ease-out',
                'hover:shadow-md hover:-translate-y-0.5',
                'flex items-center justify-center text-center border-2',
                selectedEthnicity.value === ethnicity
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-900 border-gray-200 hover:border-black',
              )}
            >
              <span className='font-medium'>{ethnicity}</span>
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
              selectedEthnicity.value
                ? 'bg-black hover:bg-gray-800'
                : 'bg-gray-300 cursor-not-allowed',
            )}
            disabled={!selectedEthnicity.value}
          >
            Continue
          </button>
        </div>
      </form>

      {/* Navigation buttons */}
      <div className='flex justify-between items-center mt-6'>
        <button
          type='button'
          onClick={handleBack}
          className='text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200'
        >
          ← Back
        </button>
        <button
          type='button'
          onClick={handleBackToLogin}
          className='text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200'
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
