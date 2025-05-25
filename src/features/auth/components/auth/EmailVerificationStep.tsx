// src/features/auth/components/auth/EmailVerificationStep.tsx

'use client';
import { useSignUp, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import type { UserRole } from '@/src/shared/types';

import {
  authErrorSignal,
  verificationEmailAddress,
  emailVerificationCode,
} from '../../state/authState';
import { getOnboardingData } from '../../utils/onboardingStorage';
import { getRouteForRole } from '../../utils/routerUtil';

// Type for user validation response
interface UserValidationResponse {
  exists: boolean;
  user?: {
    id: number;
    clerkId: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
  };
}

// Helper function for polling the user endpoint
// CRITICAL: This ensures webhook processing completes before redirect
const pollForUser = async (
  clerkId: string,
  retries = 15,
  delay = 2000,
): Promise<UserValidationResponse> => {
  console.log(`Polling for user (attempt ${16 - retries}/15):`, { clerkId, retries, delay });

  try {
    const response = await fetch('/api/auth/validate-user-db-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('Poll result:', {
      exists: result.exists,
      hasUser: !!result.user,
      userRole: result.user?.role,
      attempt: 16 - retries,
    });

    if (result.exists && result.user && result.user.role) {
      console.log('✅ User found with role, webhook processing complete');
      return result;
    }

    if (retries <= 0) {
      console.error('❌ Polling exhausted, webhook may have failed');
      return { exists: false };
    }

    console.log(`⏳ User not ready, retrying in ${delay}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return pollForUser(clerkId, retries - 1, delay);
  } catch (error) {
    console.error('Polling error:', error);

    if (retries <= 0) {
      console.error('❌ Polling failed after all retries');
      return { exists: false };
    }

    console.log(`⚠️ Polling error, retrying in ${delay}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return pollForUser(clerkId, retries - 1, delay);
  }
};

export function EmailVerificationStep() {
  const router = useRouter();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const { setActive } = useClerk();
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
          await setActive({
            session: result.createdSessionId,
            beforeEmit: () => {
              console.log('Setting active session with ID:', result.createdSessionId);
            },
          });

          console.log('Active session set, waiting for webhook processing...');

          const userPollResult = await pollForUser(signUp.createdUserId, 15, 2000);

          if (userPollResult.exists && userPollResult.user) {
            const userRole = userPollResult.user.role as UserRole;
            const redirectRoute = getRouteForRole(userRole);

            console.log('Email verification complete, redirecting based on role:', {
              userRole,
              redirectRoute,
              userId: userPollResult.user.id,
              clerkId: userPollResult.user.clerkId,
            });

            router.replace(redirectRoute);
          } else {
            console.error('Webhook processing failed or user not found after polling');
            authErrorSignal.value =
              'Account setup failed. Please contact support or try logging in.';
          }
        } else {
          authErrorSignal.value = 'Account verification incomplete. Please log in.';
          router.push('/login');
        }
      } else {
        authErrorSignal.value = `Verification failed. Please check the code and try again.`;
      }
    } catch (error) {
      console.error('Email verification error:', error);
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
