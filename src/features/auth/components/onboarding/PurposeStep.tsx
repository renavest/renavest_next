// src/features/auth/components/onboarding/PurposeStep.tsx
'use client';

import React from 'react'; // Import React

import { cn } from '@/src/lib/utils';
import {
  LucideArrowLeft,
  Scale,
  HeartPulse,
  Rocket,
  TrendingUp,
  CircleDollarSign,
  Ellipsis,
} from 'lucide-react';
// Removed direct signal import, use global signal instead
import { authErrorSignal } from '../../state/authState';
import { firstName, selectedPurpose, currentStep } from '../../state/authState';
import { OnboardingStep } from '../../types';

// Define Renavest purpose options with Lucide icons
const RENAVEST_PURPOSE_OPTIONS = [
  {
    value: 'improve_financial_habits',
    label: 'Improve my financial habits',
    icon: <Scale />,
  },
  {
    value: 'reduce_financial_stress',
    label: 'Reduce financial stress',
    icon: <HeartPulse />,
  },
  {
    value: 'plan_for_future',
    label: 'Plan for future goals',
    icon: <Rocket />,
  },
  {
    value: 'investing_help',
    label: 'Learn about investing',
    icon: <TrendingUp />,
  },
  {
    value: 'debt_help',
    label: 'Get help with debt',
    icon: <CircleDollarSign />,
  },
  {
    value: 'other',
    label: 'Other',
    icon: <Ellipsis />,
  },
];

export function RenavestPurposeStep() {
  const authError = authErrorSignal.value;

  const handlePurposeSelect = (purpose: string) => {
    selectedPurpose.value = purpose;
  };
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    firstName.value = e.target.value;
  };
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPurpose.value && firstName.value.trim()) {
      currentStep.value = OnboardingStep.AGE_RANGE;
    }
  };
  const handleBack = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };
  const handleBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };

  return (
    <div className='space-y-8'>
      <div className='flex flex-col items-center mb-10 text-center'>
        <p className='text-base text-gray-900 mb-2 font-normal'>Welcome to Renavest!</p>
        <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center flex-wrap'>
          <span role='img' aria-label='wave' className='mr-2'>
            👋
          </span>{' '}
          Hi
          <form onSubmit={handleContinue} className='inline-block'>
            <input
              type='text'
              value={firstName.value}
              onChange={handleFirstNameChange}
              placeholder='First name'
              required
              className='mx-1 px-1 text-center text-black font-semibold w-32 sm:w-40 bg-transparent outline-none focus:outline-none border-b-2 border-dotted border-gray-900 placeholder-gray-400'
            />
          </form>{' '}
          ! Tell us why you're here.
        </h2>
        <p className='text-base text-gray-600'>Choose your primary goal for using Renavest.</p>
        {authError && (
          <div
            className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in mt-4'
            role='alert'
          >
            <span className='block sm:inline'>{authError}</span>
          </div>
        )}
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 space-y-0 sm:space-y-0'>
        {RENAVEST_PURPOSE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type='button'
            onClick={() => handlePurposeSelect(option.value)}
            className={cn(
              'w-full p-4 rounded-xl text-left transition-all duration-300 ease-out min-h-24',
              'hover:shadow-md hover:-translate-y-0.5',
              'flex flex-col items-start justify-center text-left border-2',
              selectedPurpose.value === option.value
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-900 border-gray-200 hover:border-black',
            )}
          >
            <div
              className={cn(
                'mb-2',
                selectedPurpose.value === option.value ? 'text-white' : 'text-gray-500',
              )}
            >
              {option.icon}
            </div>
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
            selectedPurpose.value && firstName.value.trim()
              ? 'bg-black hover:bg-gray-800'
              : 'bg-gray-300 cursor-not-allowed',
          )}
          disabled={!selectedPurpose.value || !firstName.value.trim()}
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
