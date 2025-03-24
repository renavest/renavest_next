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
    description: 'Manage your HSA program',
  },
  {
    value: 'therapist',
    label: 'Therapist',
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

function LoginFormFields() {
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
        // Use Clerk's setActive method to handle session
        await result.createdSessionId;

        // Redirect will be handled by middleware
        window.location.href = getDashboardPath(selectedRoleSignal.value);
      } else {
        authErrorSignal.value = 'Sign in failed. Please try again.';
      }
    } catch (err) {
      console.error('Sign in error:', err);
      authErrorSignal.value = 'Failed to sign in. Please try again.';
    }
  };

  return (
    <form onSubmit={handleEmailSignIn} className='space-y-6'>
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
        Sign in with Email
      </button>
    </form>
  );
}

export default function LoginForm() {
  return (
    <div className='space-y-6'>
      <RoleSelection />

      {authErrorSignal.value && <AuthErrorMessage message={authErrorSignal.value} />}

      {selectedRoleSignal.value && (
        <>
          <LoginFormFields />

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
    </div>
  );
}
