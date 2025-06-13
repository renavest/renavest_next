// src/features/auth/components/auth/SignupStep.tsx
'use client';

import { useSignUp, useUser } from '@clerk/nextjs';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
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
import {
  trackAuthPageView,
  trackSignupAttempt,
  trackSignupSuccess,
  trackSignupError,
} from '../../utils/authTracking';
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

// Using official Clerk error handling - no custom type guard needed

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
  // Use official Clerk error handling pattern with comprehensive error codes
  if (isClerkAPIResponseError(err)) {
    // Get the first error message from Clerk API response
    const clerkError = err.errors[0];

    // Handle specific Clerk error codes for better UX
    if (clerkError?.code === 'form_identifier_exists') {
      return 'An account with this email already exists. Please sign in instead.';
    } else if (clerkError?.code === 'form_password_pwned') {
      return 'This password has been found in a data breach. Please choose a different password.';
    } else if (clerkError?.code === 'form_password_too_common') {
      return 'This password is too common. Please choose a more secure password.';
    } else if (clerkError?.code === 'form_password_validation') {
      return 'Password does not meet security requirements. Please choose a stronger password.';
    } else if (clerkError?.code === 'captcha_invalid') {
      return 'Security validation failed. Please try using a different browser or disable extensions.';
    } else if (clerkError?.code === 'sign_up_mode_restricted') {
      return 'New sign-ups are currently restricted. Please contact support.';
    } else if (clerkError?.code === 'sign_up_restricted_waitlist') {
      return 'Sign-ups are currently unavailable. Join the waitlist, and you will be notified when access becomes available.';
    } else if (clerkError?.code === 'resource_forbidden') {
      return 'Access to sign-up is forbidden. Please contact support if you believe this is an error.';
    } else if (clerkError?.code === 'request_body_invalid') {
      return 'Invalid signup data. Please check all fields and try again.';
    } else if (clerkError?.longMessage) {
      return clerkError.longMessage;
    } else if (clerkError?.message) {
      return clerkError.message;
    }
  } else if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  } else if (err instanceof Error) {
    return err.message;
  }

  return 'Signup failed due to an unexpected error. Please try again.';
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

// User authentication check hook
function useAuthenticatedUserRedirect() {
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();

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

  return { user, userLoaded };
}

// Signup form submission logic
async function handleSignupSubmission(
  signUp: ReturnType<typeof useSignUp>['signUp'],
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  onboardingData: Record<string, string | boolean | null>,
  selectedRole: string,
  selectedSponsoredGroup: string | null,
) {
  // Comprehensive pre-validation
  const validationError = validateSignupForm();
  if (validationError) {
    throw new Error(validationError);
  }

  if (!signUp) {
    throw new Error('Signup service is currently unavailable. Please try again later.');
  }

  // Check email eligibility with proper error handling
  try {
    const isEmailAllowed = await checkEmailEligibility(email);
    if (!isEmailAllowed) {
      throw new Error('This email domain is not authorized for signup. Please contact support.');
    }
  } catch (error) {
    console.error('Email eligibility check failed:', error);
    throw new Error('Unable to verify email eligibility. Please try again.');
  }

  // Store onboarding data before Clerk signup attempt
  try {
    setOnboardingData(onboardingData);
  } catch (error) {
    console.error('Failed to store onboarding data:', error);
    // Non-blocking - continue with signup
  }

  // Attempt Clerk user creation with comprehensive metadata
  const result = await signUp.create({
    emailAddress: email,
    password: password,
    firstName: firstName,
    lastName: lastName,
    unsafeMetadata: {
      role: selectedRole,
      onboardingComplete: false,
      firstName: firstName,
      lastName: lastName,
      email: email,
      purpose: onboardingData.purpose,
      ageRange: onboardingData.ageRange,
      maritalStatus: onboardingData.maritalStatus,
      ethnicity: onboardingData.ethnicity,
      agreeToTerms: onboardingData.agreeToTerms,
      sponsoredGroupName: selectedSponsoredGroup || '',
      // Add timestamp for debugging webhook issues
      signupTimestamp: new Date().toISOString(),
    },
  });

  return result;
}

export function SignupStep() {
  const { signUp } = useSignUp();
  const { user, userLoaded } = useAuthenticatedUserRedirect();

  // Track page view on component mount
  React.useEffect(() => {
    trackAuthPageView('signup');
  }, []);

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
    isSignupLoading.value = true;

    // Set agreeToTerms to true since user already confirmed in PrivacyPledgeStep
    agreeToTerms.value = true;

    // Gather onboarding data
    const onboardingData = getOnboardingDataFromSignals();

    // Track signup attempt
    trackSignupAttempt(selectedRole.value || 'unknown', 'email_password', {
      email_domain: email.value.split('@')[1],
      has_onboarding_data: Object.keys(onboardingData).length > 0,
      sponsored_group: selectedSponsoredGroup.value,
    });

    try {
      const result = await handleSignupSubmission(
        signUp,
        email.value,
        password.value,
        firstName.value,
        lastName.value,
        onboardingData,
        selectedRole.value || 'employee',
        selectedSponsoredGroup.value,
      );

      // Handle successful signup result
      if (result.status === 'complete' || result.status === 'missing_requirements') {
        // Track successful signup
        trackSignupSuccess(selectedRole.value || 'unknown', 'email_password', {
          email_domain: email.value.split('@')[1],
          verification_required: result.status === 'missing_requirements',
          sponsored_group: selectedSponsoredGroup.value,
        });

        verificationEmailAddress.value = email.value;

        // Prepare email verification if required
        if (result.status === 'missing_requirements') {
          try {
            await signUp.prepareVerification({ strategy: 'email_code' });
          } catch (verificationError) {
            console.error('Failed to prepare email verification:', verificationError);
            // Continue anyway - user can retry verification
          }
        }

        currentStep.value = OnboardingStep.EMAIL_VERIFICATION;
      } else {
        // Handle incomplete signup status
        console.error('Unexpected signup status:', result.status);
        authErrorSignal.value =
          'Signup completed but requires additional verification. Please check your email.';
      }
    } catch (err: unknown) {
      const errorMessage = handleSignupError(err);
      authErrorSignal.value = errorMessage;

      // Track signup error with detailed context
      trackSignupError(selectedRole.value || 'unknown', err, 'email_password', {
        email_domain: email.value.split('@')[1],
        sponsored_group: selectedSponsoredGroup.value,
        error_context: 'signup_submission',
      });

      console.error('Signup failed:', {
        error: err,
        email: email.value,
        role: selectedRole.value,
        sponsoredGroup: selectedSponsoredGroup.value,
      });
    } finally {
      isSignupLoading.value = false;
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
