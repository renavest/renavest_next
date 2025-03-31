'use client';

import Link from 'next/link';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { authErrorSignal, selectedRoleSignal } from '../state/authState';
import { UserType } from '../types/auth';

import GoogleSignInButton from './GoogleSignInButton';

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

export default function AuthenticationForm() {
  return (
    <div className='space-y-8 max-w-md mx-auto'>
      <div className='text-center'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
          Start Your Financial Wellness Journey
        </h1>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto mb-6'>
          Transform your relationship with money
        </p>
      </div>

      <RoleSelection />

      {authErrorSignal.value && <AuthErrorMessage message={authErrorSignal.value} />}

      {selectedRoleSignal.value && (
        <>
          <div className='grid gap-4'>
            <GoogleSignInButton />
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
