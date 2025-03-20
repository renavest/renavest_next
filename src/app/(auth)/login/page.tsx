'use client';

import GoogleSignInButton from '@/src/features/auth/components/GoogleSignInButton';
import MicrosoftSignInButton from '@/src/features/auth/components/MicrosoftSignInButton';
import WelcomeSection from '@/src/features/auth/components/WelcomeSection';
import {
  authErrorSignal,
  emailSignal,
  passwordSignal,
  selectedRoleSignal,
} from '@/src/features/auth/state/authState';
import { UserType } from '@/src/features/auth/types/auth';
import { setMockUserRole } from '@/src/features/auth/utils/mockAuth';
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
      // Set the mock user's role and email
      setMockUserRole(selectedRoleSignal.value);

      // Redirect to the appropriate dashboard
      window.location.href = `/${selectedRoleSignal.value === 'employer' ? 'employer' : selectedRoleSignal.value === 'therapist' ? 'therapist' : ''}/dashboard`;
    } catch (err) {
      console.error('Sign in error:', err);
      authErrorSignal.value = 'Failed to sign in. Please try again.';
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

          <RoleSelector
            selectedRole={selectedRoleSignal.value}
            onRoleSelect={(role) => (selectedRoleSignal.value = role)}
          />

          {authErrorSignal.value && (
            <div className='text-red-500 text-sm'>{authErrorSignal.value}</div>
          )}

          {selectedRoleSignal.value && (
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
          )}
        </div>
      </div>
    </div>
  );
}
