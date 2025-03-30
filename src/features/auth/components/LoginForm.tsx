'use client';

import { useSignIn, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import posthog from 'posthog-js';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import {
  authErrorSignal,
  authModeSignal,
  emailSignal,
  passwordSignal,
  selectedRoleSignal,
} from '../state/authState';
import { UserType } from '../types/auth';

import GoogleSignInButton from './GoogleSignInButton';
import MicrosoftSignInButton from './MicrosoftSignInButton';

function AuthErrorMessage({ message }: { message: string }) {
  return (
    <div
      className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative'
      role='alert'
    >
      <span className='block sm:inline'>{message}</span>
    </div>
  );
}

const ROLE_OPTIONS: { value: UserType; label: string; description: string }[] = [
  {
    value: 'employee',
    label: 'Employee',
    description: 'Access your financial wellness benefits',
  },
  {
    value: 'employer',
    label: 'Employer',
    description: "Manage your team's financial wellness program",
  },
  {
    value: 'therapist',
    label: 'Financial Therapist',
    description: 'Manage your client sessions',
  },
];

function RoleSelection() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {ROLE_OPTIONS.map((role) => (
        <button
          key={role.value}
          type='button'
          onClick={() => (selectedRoleSignal.value = role.value)}
          className={cn(
            'p-4 rounded-lg border-2 text-left transition-all duration-200',
            selectedRoleSignal.value === role.value
              ? `border-[#9071FF] ${COLORS.WARM_PURPLE['5']} ring-2 ring-[#9071FF]/20`
              : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50',
          )}
        >
          <h3 className='font-semibold text-gray-900'>{role.label}</h3>
          <p className='text-sm text-gray-600'>{role.description}</p>
        </button>
      ))}
    </div>
  );
}

// Extract email sign-in logic to a separate function
async function handleEmailSignIn(
  e: React.FormEvent,
  signIn: ReturnType<typeof useSignIn>['signIn'],
  isLoaded: boolean,
  clerk: ReturnType<typeof useClerk>,
): Promise<boolean> {
  e.preventDefault();

  // Validate role selection
  if (!selectedRoleSignal.value) {
    authErrorSignal.value = 'Please select a role before continuing';
    return false;
  }

  // Validate email and password
  if (!emailSignal.value || !passwordSignal.value) {
    authErrorSignal.value = 'Please enter both email and password';
    return false;
  }

  try {
    // Check authentication system readiness
    if (!isLoaded || !signIn) {
      authErrorSignal.value = 'Authentication system is not ready';
      return false;
    }

    // Determine redirect URL based on selected role
    const redirectUrl =
      selectedRoleSignal.value === 'employee'
        ? '/employee'
        : selectedRoleSignal.value === 'therapist'
          ? '/therapist'
          : selectedRoleSignal.value === 'employer'
            ? '/employer'
            : '/employee';

    // Track signup attempt
    posthog.capture('user_signup_attempt', {
      method: 'email',
      role: selectedRoleSignal.value,
      email_domain: emailSignal.value.split('@')[1] || 'unknown',
    });

    // Attempt sign-in
    const result = await signIn.create({
      identifier: emailSignal.value,
      password: passwordSignal.value,
      redirectUrl,
    });

    // Handle successful sign-in
    if (result.status === 'complete') {
      // Update user's metadata with selected role
      const user = clerk.user;
      if (user) {
        await user.update({
          unsafeMetadata: {
            role: selectedRoleSignal.value,
          },
        });

        // Track successful signup
        posthog.capture('user_signup_success', {
          user_id: user.id,
          role: selectedRoleSignal.value,
          method: 'email',
          email_domain: emailSignal.value.split('@')[1] || 'unknown',
        });
      }

      return true;
    } else {
      authErrorSignal.value = 'Sign in failed. Please try again.';

      // Track signup failure
      posthog.capture('user_signup_failed', {
        error: 'Sign in incomplete',
        role: selectedRoleSignal.value,
        signup_stage: 'final_authentication',
      });

      return false;
    }
  } catch (err) {
    console.error('Sign in error:', err);
    authErrorSignal.value = 'Failed to sign in. Please try again.';

    // Track signup error
    posthog.capture('user_signup_error', {
      error: err instanceof Error ? err.message : 'Unknown error',
      role: selectedRoleSignal.value,
      signup_stage: 'exception',
    });

    return false;
  }
}

function EmailAuthForm() {
  const { signIn, isLoaded } = useSignIn();
  const clerk = useClerk();

  const onSubmit = async (e: React.FormEvent) => {
    await handleEmailSignIn(e, signIn, isLoaded, clerk);
  };

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      <div>
        <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
          Email address
        </label>
        <input
          id='email'
          type='email'
          value={emailSignal.value}
          onChange={(e) => (emailSignal.value = e.target.value)}
          className='block w-full px-4 py-3 rounded-md border border-gray-300 
          focus:ring-2 focus:ring-[#9071FF] focus:border-[#9071FF] 
          text-base transition-all duration-200 
          placeholder:text-gray-400'
          placeholder='you@example.com'
          required
        />
      </div>
      <div>
        <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
          Password
        </label>
        <input
          id='password'
          type='password'
          value={passwordSignal.value}
          onChange={(e) => (passwordSignal.value = e.target.value)}
          className='block w-full px-4 py-3 rounded-md border border-gray-300 
          focus:ring-2 focus:ring-[#9071FF] focus:border-[#9071FF] 
          text-base transition-all duration-200 
          placeholder:text-gray-400'
          placeholder='••••••••'
          required
        />
      </div>
      <button
        type='submit'
        className={cn(
          'w-full py-3 px-4 rounded-md text-white font-semibold text-base',
          COLORS.WARM_PURPLE.bg,
          COLORS.WARM_PURPLE.hover,
          'focus:outline-none focus:ring-2 focus:ring-[#9071FF] focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        disabled={!isLoaded}
      >
        {authModeSignal.value === 'signin' ? 'Sign In' : 'Create Account'}
      </button>
    </form>
  );
}

export default function AuthenticationForm() {
  return (
    <div className='space-y-8 max-w-md mx-auto'>
      <div className='text-center'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
          {authModeSignal.value === 'signin' ? 'Welcome Back' : 'Create Your Account'}
        </h1>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto mb-6'>
          {authModeSignal.value === 'signin'
            ? 'Continue your financial wellness journey'
            : 'Start transforming your relationship with money'}
        </p>

        <div className='flex justify-center mb-6'>
          <div className='inline-flex rounded-full shadow-sm bg-gray-100 p-1' role='group'>
            <button
              type='button'
              onClick={() => {
                authModeSignal.value = 'signin';
                authErrorSignal.value = '';
              }}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-full transition-all duration-200',
                authModeSignal.value === 'signin'
                  ? `${COLORS.WARM_PURPLE.bg} text-white`
                  : 'bg-transparent text-gray-600 hover:bg-gray-200',
              )}
            >
              Sign In
            </button>
            <button
              type='button'
              onClick={() => {
                authModeSignal.value = 'signup';
                authErrorSignal.value = '';
              }}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-full transition-all duration-200',
                authModeSignal.value === 'signup'
                  ? `${COLORS.WARM_PURPLE.bg} text-white`
                  : 'bg-transparent text-gray-600 hover:bg-gray-200',
              )}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      <RoleSelection />

      {authErrorSignal.value && <AuthErrorMessage message={authErrorSignal.value} />}

      {selectedRoleSignal.value && (
        <>
          <EmailAuthForm />

          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-white text-gray-500'>Or continue with</span>
            </div>
          </div>

          <div className='grid gap-4'>
            <GoogleSignInButton />
            <MicrosoftSignInButton />
          </div>
        </>
      )}

      <div className='text-center mt-6'>
        <Link
          href='/privacy'
          className='text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors'
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
