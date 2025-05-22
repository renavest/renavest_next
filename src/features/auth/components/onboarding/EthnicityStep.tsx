// src/features/auth/components/onboarding/EthnicityStep.tsx
'use client';

import React from 'react'; // Import React

import { cn } from '@/src/lib/utils';

// Removed direct signal import, use global signal instead
import { authErrorSignal, firstName, selectedEthnicity, currentStep } from '../../state/authState';
import { OnboardingStep } from '../../types';

const ETHNICITY_OPTIONS = [
  { value: 'american_indian_alaska_native', label: 'American Indian or Alaska Native' },
  { value: 'asian', label: 'Asian' },
  { value: 'black_african_american', label: 'Black or African American' },
  { value: 'hispanic_latino', label: 'Hispanic or Latino' },
  { value: 'native_hawaiian_pacific_islander', label: 'Native Hawaiian or Pacific Islander' },
  { value: 'white', label: 'White' },
  { value: 'middle_eastern_north_african', label: 'Middle Eastern or North African' },
  { value: 'multiracial', label: 'Multiracial or Biracial' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function EthnicityStep() {
  const authError = authErrorSignal.value;
  const handleEthnicitySelect = (ethnicity: string) => {
    selectedEthnicity.value = ethnicity;
  };
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEthnicity.value) {
      currentStep.value = OnboardingStep.SIGNUP;
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
        {authError && ( // Display error if exists
          <div
            className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in'
            role='alert'
          >
            <span className='block sm:inline'>{authError}</span>
          </div>
        )}
      </div>
      {/* Use a form for semantic grouping and easier submission handling */}
      <form onSubmit={handleContinue} className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {' '}
          {/* Grid Layout */}
          {ETHNICITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type='button' // Keep as button type for onClick handling
              onClick={() => handleEthnicitySelect(option.value)}
              className={cn(
                'w-full p-4 rounded-xl text-left transition-all duration-300 ease-out',
                'hover:shadow-md hover:-translate-y-0.5',
                'flex items-center justify-center text-center border-2',
                selectedEthnicity.value === option.value
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-900 border-gray-200 hover:border-black',
              )}
            >
              <span className='font-medium'>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Footer with Back and Continue */}
        <div className='flex justify-between items-center mt-6'>
          {/* Linear Back Button */}
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

          {/* Continue Button (Final Submit) */}
          <button
            type='submit' // Use type="submit" to trigger form submission (calls handleContinue)
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
      </form>{' '}
      {/* End form */}
      {/* "Have an account? Log in" below the footer, centered */}
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
