'use client';

import LoginForm from '@/src/features/auth/components/LoginForm';
import WelcomeSection from '@/src/features/auth/components/WelcomeSection';
import { authErrorSignal, selectedRoleSignal } from '@/src/features/auth/state/authState';
import { UserType } from '@/src/features/auth/types/auth';
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

          {selectedRoleSignal.value && <LoginForm />}
        </div>
      </div>
    </div>
  );
}
