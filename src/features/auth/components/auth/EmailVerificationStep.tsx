// src/features/auth/components/auth/EmailVerificationStep.tsx

'use client';
import { useSignUp, useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import {
  authErrorSignal,
  verificationEmailAddress,
  emailVerificationCode,
} from '../../state/authState';
import { getOnboardingData } from '../../utils/onboardingStorage';

// Helper function for polling the user endpoint
const pollForUser = async (
  clerkId: string,
  retries = 10,
  delay = 1000,
): Promise<{ exists: boolean }> => {
  try {
    const response = await fetch('/api/auth/validate-user-db-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId }),
      credentials: 'include',
    });

    const result = await response.json();

    if (result.exists) {
      return result;
    }

    if (retries <= 0) {
      return { exists: false };
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return pollForUser(clerkId, retries - 1, delay);
  } catch {
    if (retries <= 0) {
      return { exists: false };
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return pollForUser(clerkId, retries - 1, delay);
  }
};

export function EmailVerificationStep() {
  const router = useRouter();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const { setActive } = useClerk();
  const { user } = useUser();
  const onboardingData = getOnboardingData();

  if (!onboardingData) {
    authErrorSignal.value = 'Onboarding data not found. Please try signing up again.';
    return null;
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    emailVerificationCode.value = e.target.value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    authErrorSignal.value = null;

    try {
      if (!signUp || !isSignUpLoaded) {
        throw new Error('Sign up service unavailable');
      }

      if (emailVerificationCode.value.length !== 6) {
        authErrorSignal.value = 'Please enter the 6-digit code.';
        return;
      }

      const result = await signUp.attemptEmailAddressVerification({
        code: emailVerificationCode.value,
      });

      if (result.status === 'complete') {
        if (signUp.createdUserId) {
          await setActive({ session: result.createdSessionId });

          // Wait for webhook to process user creation
          const userPollResult = await pollForUser(signUp.createdUserId);

          if (userPollResult.exists) {
            // Let the webhook handle all metadata updates
            // Just reload the user and redirect
            if (user) {
              await user.reload();
            }
            await setActive({ session: result.createdSessionId });
            window.location.reload();
          } else {
            authErrorSignal.value = 'Account setup failed. Please contact support.';
          }
        } else {
          authErrorSignal.value = 'Account verification incomplete. Please log in.';
          router.push('/login');
        }
      } else {
        authErrorSignal.value = `Verification failed. Please check the code and try again.`;
      }
    } catch {
      authErrorSignal.value = 'Verification failed. Please try again.';
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    authErrorSignal.value = null;
    try {
      if (!signUp || !isSignUpLoaded) {
        authErrorSignal.value = 'Service unavailable to resend code.';
        return;
      }

      await signUp.reload();
      await signUp.prepareVerification({ strategy: 'email_code' });
      authErrorSignal.value = 'Verification code resent. Check your inbox.';
    } catch {
      authErrorSignal.value = 'Failed to resend verification code.';
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>Verify Your Email</h2>
        <p className='text-gray-600 text-center'>
          We sent a verification code to{' '}
          <span className='font-medium break-all'>{verificationEmailAddress.value}</span>. Please
          enter the code below.
        </p>
      </div>

      {authErrorSignal.value && (
        <div
          className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in'
          role='alert'
        >
          <span className='block sm:inline'>{authErrorSignal.value}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-1'>
          <label htmlFor='code' className='block text-sm font-medium text-gray-700 mb-1'>
            Verification Code
          </label>
          <input
            type='text'
            id='code'
            value={emailVerificationCode.value}
            onChange={handleCodeChange}
            required
            minLength={6}
            maxLength={6}
            inputMode='numeric'
            autoComplete='one-time-code'
            className='block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
            placeholder='Enter the 6-digit code'
            disabled={isLoading}
          />
        </div>

        <button
          type='submit'
          className='w-full py-3 px-6 rounded-full shadow-md text-sm font-medium text-white bg-black hover:bg-gray-800 transition-all duration-300 ease-in-out transform'
          disabled={isLoading || emailVerificationCode.value.length !== 6}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>

        <div className='text-center mt-4'>
          <button
            type='button'
            onClick={handleResendCode}
            className='text-gray-900 hover:underline font-medium text-sm'
            disabled={isLoading}
          >
            Resend Verification Code
          </button>
        </div>
      </form>
    </div>
  );
}
