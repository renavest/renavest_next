'use client';

import { cn } from '@/src/lib/utils';
import type { UserRole } from '@/src/shared/types';

import { selectedRole, currentStep } from '../../state/authState';
import { OnboardingStep } from '../../types';

const ROLE_OPTIONS = [
  {
    value: 'employee',
    label: 'Employee',
    description: 'Access mental health resources and connect with therapists',
  },
  {
    value: 'therapist',
    label: 'Therapist',
    description: 'Provide therapy services to employees',
  },
  {
    value: 'employer_admin',
    label: 'Employer',
    description: 'Manage resources for your employees',
  },
];

export function RoleSelectionStep() {
  const onRoleSelect = (role: UserRole) => {
    selectedRole.value = role;
  };
  const onContinue = () => {
    if (selectedRole.value === 'employee') {
      currentStep.value = OnboardingStep.PURPOSE;
    } else if (selectedRole.value === 'therapist' || selectedRole.value === 'employer_admin') {
      currentStep.value = OnboardingStep.SIGNUP;
    }
  };
  const onBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };
  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
          What brings you to Renavest?
        </h2>
        <p className='text-gray-600 text-center max-w-md'>
          Select your role to get started with the right experience.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        {ROLE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type='button'
            onClick={() => onRoleSelect(option.value as UserRole)}
            className={cn(
              'w-full p-4 rounded-xl text-left transition-all duration-300 ease-out',
              'hover:shadow-md hover:-translate-y-0.5',
              'flex flex-col border-2',
              selectedRole.value === option.value
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-900 border-gray-200 hover:border-black',
            )}
          >
            <span className='font-medium text-lg'>{option.label}</span>
            <span
              className={cn(
                'text-sm mt-1',
                selectedRole.value === option.value ? 'text-gray-200' : 'text-gray-600',
              )}
            >
              {option.description}
            </span>
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <div className='flex justify-center mt-6'>
        <button
          type='button'
          onClick={onContinue}
          className={cn(
            'py-3 px-6 rounded-full shadow-md text-sm font-medium text-white w-full max-w-sm',
            'transition-all duration-300 ease-in-out transform',
            selectedRole.value ? 'bg-black hover:bg-gray-800' : 'bg-gray-300 cursor-not-allowed',
          )}
          disabled={!selectedRole.value}
        >
          Continue
        </button>
      </div>

      {/* Have an account link */}
      <div className='text-center mt-4'>
        <p className='text-sm text-gray-600'>
          Already have an account?{' '}
          <button
            type='button'
            onClick={onBackToLogin}
            className='text-gray-900 hover:underline font-medium'
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
