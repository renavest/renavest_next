// src/features/auth/components/auth/SignupStep.tsx
'use client';

import { useSignUp } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';
import { signal } from '@preact-signals/safe-react';

import { ALLOWED_EMAILS } from '@/src/constants';
import { cn } from '@/src/lib/utils'; // Assuming cn utility

import {
  selectedRole,
  firstName,
  lastName,
  email,
  password,
  agreeToTerms,
  currentStep,
  authErrorSignal,
  verificationEmailAddress,
  selectedPurpose,
  selectedAgeRange,
  selectedMaritalStatus,
  selectedEthnicity,
} from '../../state/authState';
import { OnboardingStep } from '../../types';
import { checkEmailEligibility } from '../../utils/emailEligibilityUtil';
import { setOnboardingData } from '../../utils/onboardingStorage';
// Add isSignupLoading signal
const isSignupLoading = signal(false);

// Extracted form fields and checkbox into a separate component
function SignupFormFields() {
  return (
    <>
      <div className='space-y-1'>
        <label htmlFor='firstName' className='block text-sm font-medium text-gray-700 mb-1'>
          First name*
        </label>
        <input
          type='text'
          id='firstName'
          value={firstName.value}
          onChange={(e) => (firstName.value = e.target.value)}
          required
          className='block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
          placeholder='Seth'
        />
      </div>

      <div className='space-y-1'>
        <label htmlFor='lastName' className='block text-sm font-medium text-gray-700 mb-1'>
          Last name*
        </label>
        <input
          type='text'
          id='lastName'
          value={lastName.value}
          onChange={(e) => (lastName.value = e.target.value)}
          required
          className='block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
          placeholder='Enter your last name'
        />
      </div>

      <div className='space-y-1'>
        <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
          Email*
        </label>
        <input
          type='email'
          id='email'
          value={email.value}
          onChange={(e) => (email.value = e.target.value)}
          required
          className='block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
          placeholder='Enter your email address'
        />
      </div>

      <div className='space-y-1'>
        <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
          Create password*
        </label>
        <input
          type='password'
          id='password'
          value={password.value}
          onChange={(e) => (password.value = e.target.value)}
          required
          minLength={8}
          className='block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
          placeholder='Use at least 8 characters'
        />
      </div>

      <div className='flex items-center mt-4'>
        <input
          id='agreeToTerms'
          type='checkbox'
          checked={agreeToTerms.value}
          onChange={(e) => (agreeToTerms.value = e.target.checked)}
          required
          className='h-4 w-4 text-black focus:ring-black border-gray-300 rounded'
        />
        <label htmlFor='agreeToTerms' className='ml-2 block text-sm text-gray-700'>
          * I agree to the{' '}
          <Link href='/terms' className='text-gray-900 hover:underline'>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href='/privacy' className='text-gray-900 hover:underline'>
            Privacy Policy
          </Link>
        </label>
      </div>
    </>
  );
}

// Type guard for Clerk API errors
function isClerkAPIError(err: unknown): err is { errors: { message: string }[] } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'errors' in err &&
    Array.isArray((err as { errors?: unknown }).errors) &&
    (err as { errors: unknown[] }).errors.length > 0 &&
    typeof (err as { errors: { message?: unknown }[] }).errors[0].message === 'string'
  );
}

// Utility to gather onboarding data from signals
function getOnboardingDataFromSignals() {
  return {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    purpose: selectedPurpose.value,
    ageRange: selectedAgeRange.value,
    maritalStatus: selectedMaritalStatus.value,
    ethnicity: selectedEthnicity.value,
    agreeToTerms: agreeToTerms.value,
    role: selectedRole.value,
    // Add more fields as needed
  };
}

export function SignupStep() {
  const { signUp } = useSignUp();
  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    authErrorSignal.value = null;
    isSignupLoading.value = true; // Set loading state
    // Store onboarding data in localStorage
    const onboardingData = getOnboardingDataFromSignals();
    try {
      if (password.value.length < 8) {
        authErrorSignal.value = 'Password must be at least 8 characters long.';
        isSignupLoading.value = false;
        return;
      }
      if (firstName.value.length === 0) {
        authErrorSignal.value = 'First name is required.';
        isSignupLoading.value = false;
        return;
      }
      if (lastName.value.length === 0) {
        authErrorSignal.value = 'Last name is required.';
        isSignupLoading.value = false;
        return;
      }
      if (!signUp) {
        authErrorSignal.value = 'Signup service unavailable.';
        isSignupLoading.value = false;
        return;
      }

      const isEmailAllowed = await checkEmailEligibility(email.value);
      if (!isEmailAllowed) {
        authErrorSignal.value = 'Email is not allowed.';
        isSignupLoading.value = false;
        return;
      }
      setOnboardingData(onboardingData);
      const result = await signUp.create({
        emailAddress: email.value,
        password: password.value,
        firstName: firstName.value,
        lastName: lastName.value,
        unsafeMetadata: {
          role: selectedRole.value,
          onboardingComplete: false,
        },
      });
      if (result.status === 'complete' || result.status === 'missing_requirements') {
        verificationEmailAddress.value = email.value;
        signUp.prepareVerification({ strategy: 'email_code' });
        currentStep.value = OnboardingStep.EMAIL_VERIFICATION;
      } else {
        authErrorSignal.value = 'Signup requires further verification.';
      }
    } catch (err: unknown) {
      if (isClerkAPIError(err)) {
        authErrorSignal.value = err.errors[0].message;
      } else if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
      ) {
        authErrorSignal.value = (err as { message: string }).message;
      } else {
        authErrorSignal.value = 'Signup failed. Please try again.';
      }
    } finally {
      isSignupLoading.value = false; // Always reset loading state
    }
  };
  const onBack = () => {
    if (selectedRole.value === 'employee') {
      currentStep.value = OnboardingStep.ETHNICITY;
    } else {
      currentStep.value = OnboardingStep.ROLE_SELECTION;
    }
  };
  const onBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };
  const isFormValid =
    firstName.value.trim() &&
    lastName.value.trim() &&
    email.value.trim() &&
    password.value.trim() &&
    agreeToTerms.value;
  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <div className='text-base text-gray-900 mb-2 text-center'>"You're almost there!"</div>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
          Just one more step to set up your account.
        </h2>
      </div>

      {/* Input fields and checkbox */}
      <div className='space-y-4'>
        <SignupFormFields />
        {/* Clerk CAPTCHA Widget */}
        <div className='mt-4 flex justify-center'>
          <div
            id='clerk-captcha'
            data-cl-theme='dark'
            data-cl-size='flexible'
            data-cl-language='es-ES'
          />
        </div>
      </div>

      {/* Footer with Back and Join */}
      <div className='flex justify-between items-center mt-6'>
        {/* Linear Back Button */}
        <button type='button' onClick={onBack} className='p-2 text-gray-600 hover:text-gray-900'>
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

        {/* Join Button (acts as Continue) */}
        <button
          type='button' // Use type="button" and onClick handler
          onClick={onSignUp} // This calls the handler in AuthenticationFlow
          className={cn(
            'py-3 px-6 rounded-full shadow-md text-sm font-medium text-white bg-black hover:bg-gray-800',
            'transition-all duration-300 ease-in-out transform',
            isFormValid ? '' : 'bg-gray-300 cursor-not-allowed',
            isSignupLoading.value ? 'opacity-50 cursor-wait' : '',
          )}
          disabled={!isFormValid || isSignupLoading.value} // Disable if form is not valid or loading
        >
          {isSignupLoading.value ? (
            <div className='flex items-center justify-center'>
              <svg
                className='animate-spin h-5 w-5 mr-2'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Loading...
            </div>
          ) : (
            'Join Renavest'
          )}
        </button>
      </div>

      {/* "Have an account? Log in" below the footer, centered */}
      <div className='text-center mt-4'>
        <p className='text-sm text-gray-600'>
          Have an account?{' '}
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
