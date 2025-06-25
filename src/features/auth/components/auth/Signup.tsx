// src/features/auth/components/auth/Signup.tsx
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
import type { OnboardingData } from '../../types';
import {
  trackAuthPageView,
  trackSignupAttempt,
  trackSignupSuccess,
  trackSignupError,
} from '../../utils/authTracking';
import { getRouteForRole } from '../../utils/routerUtil';
import {
  handleSignupError,
  handleGoogleSignup,
  handleEmailPasswordSignup,
} from '../../utils/signupHelpers';

// Loading signals
const isSignupLoading = signal(false);
const isGoogleSignupLoading = signal(false);

// Password input component
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
        >
          <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d={
                showPassword
                  ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                  : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              }
            />
            {!showPassword && (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
};

// Google signup button component
const GoogleSignupButton = ({
  onGoogleSignup,
  isLoading,
}: {
  onGoogleSignup: () => void;
  isLoading: boolean;
}) => (
  <div className='space-y-4'>
    <div className='text-center'>
      <p className='text-sm text-gray-600 mb-4'>
        Sign up quickly with your Google account or create an account below.
      </p>
    </div>
    <button
      type='button'
      onClick={onGoogleSignup}
      disabled={isLoading}
      className={cn(
        'w-full flex items-center justify-center gap-x-3 rounded-md bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-300',
        isLoading ? 'opacity-50 cursor-wait' : 'hover:shadow-md',
      )}
    >
      {isLoading ? (
        <div className='flex items-center justify-center'>
          <svg className='animate-spin h-5 w-5 mr-2' fill='none' viewBox='0 0 24 24'>
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
          Setting up your account...
        </div>
      ) : (
        <>
          <img src='/google-logo.svg' alt='Google' className='w-5 h-5' />
          Continue with Google
        </>
      )}
    </button>
    <div className='relative my-6'>
      <div className='absolute inset-0 flex items-center'>
        <div className='w-full border-t border-gray-300' />
      </div>
      <div className='relative flex justify-center text-sm'>
        <span className='bg-white px-2 text-gray-500'>or</span>
      </div>
    </div>
  </div>
);

// Form fields component
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

// Signup form component
const SignupForm = ({
  selectedRole,
  onGoogleSignup,
  isGoogleSignupLoading,
  isFormValid,
  onSignUp,
  isSignupLoading,
  onBack,
  onBackToLogin,
}: {
  selectedRole: UserRole;
  onGoogleSignup: () => void;
  isGoogleSignupLoading: boolean;
  isFormValid: boolean;
  onSignUp: (e: React.FormEvent) => void;
  isSignupLoading: boolean;
  onBack: () => void;
  onBackToLogin: () => void;
}) => (
  <div className='space-y-6'>
    <div className='flex flex-col items-center mb-8'>
      <div className='text-base text-gray-900 mb-2 text-center'>"You're almost there!"</div>
      <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>
        Just one more step to set up your account.
      </h2>
    </div>

    {selectedRole === 'employee' && (
      <GoogleSignupButton onGoogleSignup={onGoogleSignup} isLoading={isGoogleSignupLoading} />
    )}

    <div className='space-y-4'>
      <SignupFormFields />
      <div className='mt-4 flex justify-center'>
        <div id='clerk-captcha' data-cl-theme='dark' data-cl-size='flexible' />
      </div>
    </div>

    <div className='flex justify-between items-center mt-6'>
      <button type='button' onClick={onBack} className='p-2 text-gray-600 hover:text-gray-900'>
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path d='M19 12H5' />
          <path d='M12 19l-7-7 7-7' />
        </svg>
      </button>

      <button
        type='button'
        onClick={onSignUp}
        className={cn(
          'py-3 px-6 rounded-full shadow-md text-sm font-medium text-white bg-black hover:bg-gray-800',
          'transition-all duration-300 ease-in-out transform',
          isFormValid ? '' : 'bg-gray-300 cursor-not-allowed',
          isSignupLoading ? 'opacity-50 cursor-wait' : '',
        )}
        disabled={!isFormValid || isSignupLoading}
      >
        {isSignupLoading ? (
          <div className='flex items-center justify-center'>
            <svg className='animate-spin h-5 w-5 mr-2' fill='none' viewBox='0 0 24 24'>
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

export function SignupStep() {
  const { signUp } = useSignUp();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    trackAuthPageView('signup');
  }, []);

  React.useEffect(() => {
    if (userLoaded && user) {
      const userRole = user.publicMetadata?.role as string | undefined;
      const onboardingComplete = user.publicMetadata?.onboardingComplete as boolean | undefined;
      if (userRole && onboardingComplete) {
        router.replace(getRouteForRole(userRole as UserRole));
      } else {
        router.replace('/auth-check');
      }
    }
  }, [userLoaded, user, router]);

  if (userLoaded && user) {
    return (
      <div className='text-center'>
        <p className='text-gray-600'>You are already signed up. Redirecting to your dashboard...</p>
      </div>
    );
  }

  const getOnboardingData = (): OnboardingData => ({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    purpose: selectedPurpose.value,
    ageRange: selectedAgeRange.value,
    maritalStatus: selectedMaritalStatus.value,
    ethnicity: selectedEthnicity.value,
    agreeToTerms: agreeToTerms.value,
    role: selectedRole.value || 'employee',
  });

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    authErrorSignal.value = null;
    isSignupLoading.value = true;
    agreeToTerms.value = true;

    const onboardingData = getOnboardingData();
    trackSignupAttempt(selectedRole.value || 'unknown', 'email_password', {
      email_domain: email.value.split('@')[1],
      has_onboarding_data: Object.keys(onboardingData).length > 0,
      sponsored_group: selectedSponsoredGroup.value,
    });

    try {
      const result = await handleEmailPasswordSignup(
        signUp,
        email.value,
        password.value,
        firstName.value,
        lastName.value,
        onboardingData,
        selectedRole.value || 'employee',
        selectedSponsoredGroup.value,
      );

      if (result.status === 'complete' || result.status === 'missing_requirements') {
        trackSignupSuccess(selectedRole.value || 'unknown', 'email_password', {
          email_domain: email.value.split('@')[1],
          verification_required: result.status === 'missing_requirements',
          sponsored_group: selectedSponsoredGroup.value,
        });

        verificationEmailAddress.value = email.value;

        if (result.status === 'missing_requirements') {
          await signUp!.prepareVerification({ strategy: 'email_code' });
        }

        currentStep.value = OnboardingStep.EMAIL_VERIFICATION;
      }
    } catch (err: unknown) {
      const errorMessage = handleSignupError(err);
      authErrorSignal.value = errorMessage;
      trackSignupError(selectedRole.value || 'unknown', err, 'email_password', {
        email_domain: email.value.split('@')[1],
        sponsored_group: selectedSponsoredGroup.value,
        error_context: 'signup_submission',
      });
    } finally {
      isSignupLoading.value = false;
    }
  };

  const onGoogleSignup = async () => {
    authErrorSignal.value = null;
    isGoogleSignupLoading.value = true;
    agreeToTerms.value = true;

    const onboardingData = getOnboardingData();
    trackSignupAttempt(selectedRole.value || 'unknown', 'google_oauth', {
      has_onboarding_data: Object.keys(onboardingData).length > 0,
      sponsored_group: selectedSponsoredGroup.value,
    });

    try {
      await handleGoogleSignup(
        signUp,
        onboardingData,
        selectedRole.value || 'employee',
        selectedSponsoredGroup.value,
      );

      trackSignupSuccess(selectedRole.value || 'unknown', 'google_oauth', {
        sponsored_group: selectedSponsoredGroup.value,
        oauth_redirect_initiated: true,
      });
    } catch (err: unknown) {
      const errorMessage = handleSignupError(err);
      authErrorSignal.value = errorMessage;
      trackSignupError(selectedRole.value || 'unknown', err, 'google_oauth', {
        sponsored_group: selectedSponsoredGroup.value,
        error_context: 'oauth_initiation',
      });
    } finally {
      isGoogleSignupLoading.value = false;
    }
  };

  const onBack = () => {
    currentStep.value =
      selectedRole.value === 'employee' ? OnboardingStep.ETHNICITY : OnboardingStep.ROLE_SELECTION;
  };

  const onBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };

  const isFormValid = Boolean(
    firstName.value.trim() && lastName.value.trim() && email.value.trim() && password.value.trim(),
  );

  return (
    <SignupForm
      selectedRole={selectedRole.value || 'employee'}
      onGoogleSignup={onGoogleSignup}
      isGoogleSignupLoading={isGoogleSignupLoading.value}
      isFormValid={isFormValid}
      onSignUp={onSignUp}
      isSignupLoading={isSignupLoading.value}
      onBack={onBack}
      onBackToLogin={onBackToLogin}
    />
  );
}
