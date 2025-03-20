'use client';

import { useState } from 'react';

import WelcomeSection from '@/src/features/auth/components/WelcomeSection';
import { UserType } from '@/src/features/auth/types/auth';
import { mockAuth, setMockUserRole } from '@/src/features/auth/utils/mockAuth';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

function RoleSelector({
  selectedRole,
  onRoleSelect,
}: {
  selectedRole: UserType | null;
  onRoleSelect: (role: UserType) => void;
}) {
  return (
    <div className='mb-8'>
      <h3 className='text-lg font-semibold mb-4'>I am a:</h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <button
          className={cn(
            'p-4 rounded-lg border-2 transition-all',
            selectedRole === 'employee'
              ? COLORS.WARM_PURPLE.border
              : 'border-gray-200 hover:border-gray-300',
          )}
          onClick={() => onRoleSelect('employee')}
        >
          <h4 className='font-medium'>Employee</h4>
          <p className='text-sm text-gray-600'>Access your financial wellness benefits</p>
        </button>
        <button
          className={cn(
            'p-4 rounded-lg border-2 transition-all',
            selectedRole === 'employer'
              ? COLORS.WARM_PURPLE.border
              : 'border-gray-200 hover:border-gray-300',
          )}
          onClick={() => onRoleSelect('employer')}
        >
          <h4 className='font-medium'>Employer</h4>
          <p className='text-sm text-gray-600'>Manage your HSA program</p>
        </button>
        <button
          className={cn(
            'p-4 rounded-lg border-2 transition-all',
            selectedRole === 'therapist'
              ? COLORS.WARM_PURPLE.border
              : 'border-gray-200 hover:border-gray-300',
          )}
          onClick={() => onRoleSelect('therapist')}
        >
          <h4 className='font-medium'>Therapist</h4>
          <p className='text-sm text-gray-600'>Manage your client sessions</p>
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (provider: 'oauth_google' | 'oauth_microsoft') => {
    if (!selectedRole) {
      setError('Please select a role before continuing');
      return;
    }

    try {
      // Set the mock user's role
      setMockUserRole(selectedRole);

      // Use mock auth to redirect
      await mockAuth.signIn.authenticateWithRedirect({
        redirectUrlComplete: `/${selectedRole === 'employer' ? 'employer' : selectedRole === 'therapist' ? 'therapist' : ''}/dashboard`,
      });
    } catch (err) {
      console.error('OAuth error:', err);
      setError('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className='flex min-h-screen'>
      <WelcomeSection />

      <div className='w-full md:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md space-y-8'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Sign in to your account</h2>
            <p className='mt-2 text-gray-600'>
              Welcome back! Please select your role and sign in to continue.
            </p>
          </div>

          <RoleSelector selectedRole={selectedRole} onRoleSelect={setSelectedRole} />

          {error && <div className='text-red-500 text-sm'>{error}</div>}

          {selectedRole && (
            <div className='space-y-6'>
              <div className='flex flex-col gap-4'>
                <button
                  onClick={() => handleSignIn('oauth_google')}
                  className='flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <img src='/google.svg' alt='Google' className='w-6 h-6' />
                  <span>Continue with Google</span>
                </button>
                <button
                  onClick={() => handleSignIn('oauth_microsoft')}
                  className='flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <img src='/microsoft.svg' alt='Microsoft' className='w-6 h-6' />
                  <span>Continue with Microsoft</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
