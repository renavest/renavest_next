'use client';

// import { useClerk, useUser } from '@clerk/nextjs';
// import Image from 'next/image';
import Link from 'next/link';
// import { useSignIn, useClerk } from '@clerk/nextjs';
// import posthog from 'posthog-js';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import {
  authErrorSignal,
  // authModeSignal,
  // emailSignal,
  // passwordSignal,
  selectedRoleSignal,
  setSelectedRole,
  // companyIntegrationSignal,
  // setUserType,
} from '../state/authState';
import { UserType } from '../types/auth';

import GoogleSignInButton from './GoogleSignInButton';
// import MicrosoftSignInButton from './MicrosoftSignInButton';

function AuthErrorMessage({ message }: { message: string }) {
  return (
    <div
      className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in'
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
  // if (typeof window !== 'undefined') {
  //   clearSelectedRole();
  // }
  const handleRoleSelection = async (role: UserType) => {
    try {
      setSelectedRole(role);
    } catch (error) {
      authErrorSignal.value = 'Failed to set role. Please try again.';
      console.error('Role selection error:', error);
    }
  };

  return (
    <div className='space-y-3'>
      {ROLE_OPTIONS.map((role, index) => (
        <button
          key={role.value}
          type='button'
          onClick={() => handleRoleSelection(role.value)}
          className={cn(
            'w-full p-4 rounded-xl text-left transition-all duration-300 ease-out',
            'hover:shadow-md hover:-translate-y-0.5',
            'animate-fade-in opacity-0',
            '[animation-delay:400ms]',
            selectedRoleSignal.value === role.value
              ? `bg-[#9071FF]/5 border-2 border-[#9071FF] ${COLORS.WARM_PURPLE['5']}`
              : 'bg-white border-2 border-gray-100 hover:border-purple-200',
            `[animation-delay:${400 + index * 100}ms]`,
          )}
        >
          <h3
            className={cn(
              'font-medium mb-1 transition-colors',
              selectedRoleSignal.value === role.value
                ? 'text-[#9071FF]'
                : 'text-gray-900 group-hover:text-[#9071FF]',
            )}
          >
            {role.label}
          </h3>
          <p className='text-sm text-gray-600'>{role.description}</p>
        </button>
      ))}
    </div>
  );
}

export default function AuthenticationForm() {
  // const { user } = useUser();
  // Remove company logic from the form

  return (
    <div className='space-y-6'>
      <div className='animate-fade-in opacity-0 [animation-delay:200ms]'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-2'>Welcome to Renavest</h2>
        <p className='text-gray-600'>Choose your role to get started with Google Sign-In</p>
      </div>

      <RoleSelection />

      {authErrorSignal.value && <AuthErrorMessage message={authErrorSignal.value} />}

      {selectedRoleSignal.value && (
        <div className='pt-2 animate-fade-in opacity-0 [animation-delay:700ms]'>
          <GoogleSignInButton />
        </div>
      )}

      <div className='text-center text-sm text-gray-500 animate-fade-in opacity-0 [animation-delay:800ms]'>
        By continuing, you agree to our{' '}
        <Link
          href='/terms'
          className='text-[#9071FF] hover:text-purple-700 hover:underline transition-colors'
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href='/privacy'
          className='text-[#9071FF] hover:text-purple-700 hover:underline transition-colors'
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
