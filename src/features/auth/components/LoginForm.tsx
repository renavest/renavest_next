'use client';

// import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';
// import { useSignIn, useClerk } from '@clerk/nextjs';
// import posthog from 'posthog-js';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import {
  authErrorSignal,
  clearSelectedRole,
  // authModeSignal,
  // emailSignal,
  // passwordSignal,
  selectedRoleSignal,
  setSelectedRole,
  // setUserType,
} from '../state/authState';
import { UserType } from '../types/auth';

import GoogleSignInButton from './GoogleSignInButton';
// import MicrosoftSignInButton from './MicrosoftSignInButton';

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
    label: 'Individual',
    description: 'Access your financial wellness journey',
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

// Commented out email sign-in function
/*
async function handleEmailSignIn(
  e: React.FormEvent,
  signIn: ReturnType<typeof useSignIn>['signIn'],
  isLoaded: boolean,
  clerk: ReturnType<typeof useClerk>,
): Promise<boolean> {
  // Previous email sign-in implementation
  // ... (full previous implementation)
}

function EmailAuthForm() {
  const { signIn, isLoaded } = useSignIn();
  const clerk = useClerk();

  const onSubmit = async (e: React.FormEvent) => {
    await handleEmailSignIn(e, signIn, isLoaded, clerk);
  };

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      // Previous email form implementation
      // ... (full previous implementation)
    </form>
  );
}
*/

function RoleSelection() {
  // const { user } = useUser();
  // const { user: clerkUser } = useClerk();
  clearSelectedRole();
  const handleRoleSelection = async (role: UserType) => {
    try {
      setSelectedRole(role);
    } catch (error) {
      authErrorSignal.value = 'Failed to set role. Please try again.';
      console.error('Role selection error:', error);
    } 
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {ROLE_OPTIONS.map((role) => (
        <button
          key={role.value}
          type='button'
          onClick={() => handleRoleSelection(role.value)}
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

export default function AuthenticationForm() {
  // const { user } = useUser();

  return (
    <div className='space-y-8 max-w-md mx-auto'>
      <div className='text-center'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
          Start Your Financial Wellness Journey
        </h1>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto mb-6'>
          Transform your relationship with money
        </p>

        {/* Commented out sign-in/sign-up toggle
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
        */}
      </div>

      <RoleSelection />

      {authErrorSignal.value && <AuthErrorMessage message={authErrorSignal.value} />}

      {selectedRoleSignal.value && (
        <>
          {/* Commented out "Or continue with" divider
          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-white text-gray-500'>Or continue with</span>
            </div>
          </div>
          */}

          <div className='grid gap-4'>
            <GoogleSignInButton />
            {/* <MicrosoftSignInButton /> */}
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
