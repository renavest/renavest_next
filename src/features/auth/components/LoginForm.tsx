'use client';

import { useSignIn } from '@clerk/nextjs';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import {
  authErrorSignal,
  emailSignal,
  passwordSignal,
  selectedRoleSignal,
} from '../state/authState';
import { UserType } from '../types/auth';

import GoogleSignInButton from './GoogleSignInButton';
import MicrosoftSignInButton from './MicrosoftSignInButton';

function getDashboardPath(role: UserType) {
  switch (role) {
    case 'employer':
      return '/employer/dashboard';
    case 'therapist':
      return '/therapist/dashboard';
    default:
      return '/employee';
  }
}

export default function LoginForm() {
  const { signIn, isLoaded } = useSignIn();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleSignal.value) {
      authErrorSignal.value = 'Please select a role before continuing';
      return;
    }

    if (!emailSignal.value || !passwordSignal.value) {
      authErrorSignal.value = 'Please enter both email and password';
      return;
    }

    const dashboardPath = getDashboardPath(selectedRoleSignal.value);

    try {
      if (!isLoaded || !signIn) {
        authErrorSignal.value = 'Authentication system is not ready';
        return;
      }

      const result = await signIn.create({
        identifier: emailSignal.value,
        password: passwordSignal.value,
      });

      if (result.status === 'complete') {
        // Set the user's role in Clerk's public metadata
        await result.createdSessionId;
        window.location.href = dashboardPath;
      } else {
        authErrorSignal.value = 'Sign in failed. Please try again.';
      }
    } catch (err) {
      console.error('Sign in error:', err);
      authErrorSignal.value = 'Failed to sign in. Please try again.';
    }
  };

  return (
    <div className='space-y-6'>
      <form onSubmit={handleEmailSignIn} className='space-y-4'>
        <div>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
            Email address
          </label>
          <input
            id='email'
            type='email'
            value={emailSignal.value}
            onChange={(e) => (emailSignal.value = e.target.value)}
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500'
            placeholder='you@example.com'
          />
        </div>
        <div>
          <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
            Password
          </label>
          <input
            id='password'
            type='password'
            value={passwordSignal.value}
            onChange={(e) => (passwordSignal.value = e.target.value)}
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500'
            placeholder='••••••••'
          />
        </div>
        <button
          type='submit'
          className={cn(
            'w-full py-2 px-4 rounded-md text-white font-medium',
            COLORS.WARM_PURPLE.bg,
            'hover:opacity-90 transition-opacity',
          )}
          disabled={!isLoaded}
        >
          Sign in with Email
        </button>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-300' />
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-2 bg-white text-gray-500'>Or continue with</span>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <GoogleSignInButton />
        <MicrosoftSignInButton />
      </div>
    </div>
  );
}
