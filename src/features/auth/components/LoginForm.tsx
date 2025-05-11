'use client';

// import { useClerk, useUser } from '@clerk/nextjs';
// import Image from 'next/image';
import { useClerk, useSignIn } from '@clerk/nextjs';
import { SignInResource } from '@clerk/types';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

// import { companyAuthOptions } from '../companyAuthOptions';

import {
  authErrorSignal,
  // authModeSignal,
  // emailSignal,
  // passwordSignal,
  selectedRoleSignal,
  // companyIntegrationSignal,
  // setUserType,
} from '../state/authState';
import { UserType } from '../types/auth';
import {
  trackLoginAttempt,
  trackLoginError,
  trackLoginSuccess,
  trackRoleSelection,
} from '../utils/authTracking';

import GoogleSignInButton from './GoogleSignInButton';
// import OAuthButton from './OAuthButton';

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

// Add email sign-in function (utility function for potential future use)
async function handleEmailSignIn(
  e: React.FormEvent,
  email: string,
  password: string,
  signIn: SignInResource,
  isLoaded: boolean,
): Promise<boolean> {
  e.preventDefault();

  if (!isLoaded) {
    authErrorSignal.value = 'Authentication system not ready. Please try again.';
    return false;
  }

  try {
    // Validate that only therapists can use email sign-in
    if (selectedRoleSignal.value !== 'therapist') {
      authErrorSignal.value = 'Email sign-in is only available for Financial Therapists.';
      return false;
    }

    // Track login attempt
    trackLoginAttempt('email', {
      email,
      role: selectedRoleSignal.value,
    });

    // Attempt sign-in with email and password
    await signIn.create({
      identifier: email,
      password: password,
    });

    // Track successful login
    trackLoginSuccess('email', {
      email,
      role: selectedRoleSignal.value,
    });

    // Handle successful sign-in (you might want to add more specific routing logic)
    window.location.href = '/dashboard';
    return true;
  } catch (error) {
    console.error('Email sign-in error:', error);

    // Track login error
    trackLoginError('email', error, {
      email,
      role: selectedRoleSignal.value,
    });

    // Handle specific Clerk error codes
    if (error instanceof Error && 'errors' in error) {
      const clerkErrors = (error as { errors: Array<{ code: string; longMessage?: string }> })
        .errors;
      if (clerkErrors && clerkErrors.length > 0) {
        const clerkError = clerkErrors[0];
        switch (clerkError.code) {
          case 'form_identifier_not_found':
            authErrorSignal.value = 'No account found with this email address.';
            break;
          case 'form_password_incorrect':
            authErrorSignal.value = 'Invalid email or password.';
            break;
          default:
            authErrorSignal.value = clerkError.longMessage || 'Sign-in failed. Please try again.';
        }
      }
    } else {
      authErrorSignal.value = 'An unexpected error occurred. Please try again.';
    }
    return false;
  }
}

function EmailAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoaded } = useSignIn();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) {
      authErrorSignal.value = 'Authentication system not ready. Please try again.';
      return;
    }

    try {
      // Validate that only therapists can use email sign-in
      if (selectedRoleSignal.value !== 'therapist') {
        authErrorSignal.value = 'Email sign-in is only available for Financial Therapists.';
        return;
      }

      // Track login attempt
      trackLoginAttempt('email', {
        email,
        role: selectedRoleSignal.value,
      });

      // Attempt sign-in with email and password
      await signIn.create({
        identifier: email,
        password: password,
      });

      // Track successful login
      trackLoginSuccess('email', {
        email,
        role: selectedRoleSignal.value,
      });

      // Handle successful sign-in (you might want to add more specific routing logic)
      window.location.href = '/therapist';
    } catch (error) {
      console.error('Email sign-in error:', error);

      // Track login error
      trackLoginError('email', error, {
        email,
        role: selectedRoleSignal.value,
      });

      // Handle specific Clerk error codes
      if (error instanceof Error && 'errors' in error) {
        const clerkErrors = (error as { errors: Array<{ code: string; longMessage?: string }> })
          .errors;
        if (clerkErrors && clerkErrors.length > 0) {
          const clerkError = clerkErrors[0];
          switch (clerkError.code) {
            case 'form_identifier_not_found':
              authErrorSignal.value = 'No account found with this email address.';
              break;
            case 'form_password_incorrect':
              authErrorSignal.value = 'Invalid email or password.';
              break;
            default:
              authErrorSignal.value = clerkError.longMessage || 'Sign-in failed. Please try again.';
          }
        }
      } else {
        authErrorSignal.value = 'An unexpected error occurred. Please try again.';
      }
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className='space-y-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-fade-in opacity-0 [animation-delay:700ms]'
    >
      <div className='space-y-1'>
        <label htmlFor='email' className='block text-sm font-semibold text-gray-700 mb-1'>
          Email Address
        </label>
        <div className='relative'>
          <span className='absolute inset-y-0 left-0 pl-3 flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
              <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
            </svg>
          </span>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#9071FF] focus:ring-2 focus:ring-[#9071FF]/30 sm:text-sm py-2.5 transition-all duration-300 ease-in-out'
            placeholder='you@example.com'
          />
        </div>
      </div>
      <div className='space-y-1'>
        <label htmlFor='password' className='block text-sm font-semibold text-gray-700 mb-1'>
          Password
        </label>
        <div className='relative'>
          <span className='absolute inset-y-0 left-0 pl-3 flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-400'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                clipRule='evenodd'
              />
            </svg>
          </span>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#9071FF] focus:ring-2 focus:ring-[#9071FF]/30 sm:text-sm py-2.5 transition-all duration-300 ease-in-out'
            placeholder='Enter your password'
          />
        </div>
      </div>
      <button
        type='submit'
        className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-[#9071FF] hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9071FF] transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0'
      >
        Sign In
      </button>
      <div className='text-center'>
        <Link
          href='/forgot-password'
          className='text-sm text-[#9071FF] hover:underline hover:text-purple-700 transition-colors'
        >
          Forgot Password?
        </Link>
      </div>
    </form>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className='relative flex items-center py-2'>
      <div className='flex-grow border-t border-gray-300'></div>
      <span className='flex-shrink mx-4 text-gray-500 text-sm'>{text}</span>
      <div className='flex-grow border-t border-gray-300'></div>
    </div>
  );
}

function RoleSelection() {
  const handleRoleSelection = async (role: UserType) => {
    try {
      // Track role selection
      trackRoleSelection(role);
      selectedRoleSignal.value = role;
    } catch (error) {
      authErrorSignal.value = 'Failed to set role. Please try again.';
      toast.error('Failed to set role.');
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
  const { user: clerkUser } = useClerk();

  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-4xl font-extrabold text-gray-900 mb-2 text-center'>
          Welcome to Renavest
        </h2>
        <div className='text-lg text-gray-500 text-center'>A safe place to talk about money</div>
      </div>

      <RoleSelection />

      {authErrorSignal.value && <AuthErrorMessage message={authErrorSignal.value} />}

      {selectedRoleSignal.value === 'therapist' && (
        <div className='space-y-4 animate-fade-in opacity-0 [animation-delay:700ms]'>
          <GoogleSignInButton />
          <Divider text='OR' />
          <EmailAuthForm />
          <div className='text-center mt-4'>
            <p className='text-sm text-gray-600'>Don't have an account?</p>
            <Link
              href='https://calendly.com/rameau-stan/one-on-one'
              className='text-sm text-[#9071FF] hover:underline'
            >
              Apply to become a financial therapist on our platform
            </Link>
          </div>
        </div>
      )}

      {selectedRoleSignal.value && selectedRoleSignal.value !== 'therapist' && (
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
