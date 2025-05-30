// src/features/auth/components/auth/SignupStep.tsx
'use client';

import { useSignUp, useUser } from '@clerk/nextjs';
import { signal } from '@preact-signals/safe-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { cn } from '@/src/lib/utils';
import type { UserRole } from '@/src/shared/types';

import {
  authErrorSignal,
  verificationEmailAddress,
  firstName,
  lastName,
  email,
  password,
  selectedRole,
  selectedPurpose,
  selectedAgeRange,
  selectedMaritalStatus,
  selectedEthnicity,
  agreeToTerms,
  currentStep,
  selectedSponsoredGroup,
} from '../../state/authState';
import { OnboardingStep } from '../../types';
import { checkEmailEligibility } from '../../utils/emailEligibilityUtil';
import { setOnboardingData } from '../../utils/onboardingStorage';
import { getRouteForRole } from '../../utils/routerUtil';

// Add isSignupLoading signal
const isSignupLoading = signal(false);

// CRITICAL: Prevent role changes by checking if user is already authenticated

// Enhanced password input component with view toggle
const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = true,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='space-y-1'>
      <label htmlFor={id} className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
      <div className='relative'>
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          className='block w-full px-4 py-2 pr-12 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
          placeholder={placeholder}
        />
        <button
          type='button'
          onClick={() => setShowPassword(!showPassword)}
          className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200'
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
              />
            </svg>
          ) : (
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// Extracted form fields into a separate component (removed checkbox)
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

      <PasswordInput
        id='password'
        label='Create password*'
        value={password.value}
        onChange={(value) => (password.value = value)}
        placeholder='Use at least 8 characters'
        required
        minLength={8}
      />
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

// Validation helper functions
const validateSignupForm = () => {
  if (password.value.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (firstName.value.length === 0) {
    return 'First name is required.';
  }
  if (lastName.value.length === 0) {
    return 'Last name is required.';
  }
  return null;
};

const handleSignupError = (err: unknown) => {
  if (isClerkAPIError(err)) {
    return err.errors[0].message;
  } else if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  } else {
    return 'Signup failed. Please try again.';
  }
};

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
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  // CRITICAL: Prevent authenticated users from accessing signup
  // This prevents role changes after initial signup
  React.useEffect(() => {
    if (userLoaded && user) {
      console.warn('Authenticated user attempting to access signup - redirecting to dashboard');

      // Check if user has completed onboarding (has role and onboardingComplete flag)
      const userRole = user.publicMetadata?.role as string | undefined;
      const onboardingComplete = user.publicMetadata?.onboardingComplete as boolean | undefined;

      if (userRole && onboardingComplete) {
        // User has completed onboarding, redirect to their dashboard
        const redirectRoute = getRouteForRole(userRole as UserRole);
        router.replace(redirectRoute);
      } else {
        // User hasn't completed onboarding yet, redirect to auth-check to wait for webhook
        console.log('User onboarding not complete, redirecting to auth-check', {
          userRole,
          onboardingComplete,
          userId: user.id,
        });
        router.replace('/auth-check');
      }
    }
  }, [userLoaded, user, router]);

  // Don't render signup form if user is already authenticated
  if (userLoaded && user) {
    return (
      <div className='text-center'>
        <p className='text-gray-600'>You are already signed up. Redirecting to your dashboard...</p>
      </div>
    );
  }

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    authErrorSignal.value = null;
    isSignupLoading.value = true; // Set loading state

    // Set agreeToTerms to true since user already confirmed in PrivacyPledgeStep
    agreeToTerms.value = true;

    // Store onboarding data in localStorage
    const onboardingData = getOnboardingDataFromSignals();
    try {
      const error = validateSignupForm();
      if (error) {
        authErrorSignal.value = error;
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
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          purpose: selectedPurpose.value,
          ageRange: selectedAgeRange.value,
          maritalStatus: selectedMaritalStatus.value,
          ethnicity: selectedEthnicity.value,
          agreeToTerms: agreeToTerms.value,
          sponsoredGroupName: selectedSponsoredGroup.value,
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
      authErrorSignal.value = handleSignupError(err);
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
    firstName.value.trim() && lastName.value.trim() && email.value.trim() && password.value.trim();
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
