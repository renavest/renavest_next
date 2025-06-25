'use client';

import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { clearOnboardingState } from '@/src/features/onboarding/state/onboardingState';

import type { LogoutButtonProps } from '../../types';

export function LogoutButton({
  className = 'flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded-md',
  variant = 'default',
  size = 'default',
}: LogoutButtonProps) {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut();
      clearOnboardingState();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  const baseClasses = 'flex items-center space-x-2 rounded-md transition-colors';
  const variantClasses = {
    default: 'text-gray-700 hover:bg-gray-100',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  };
  const sizeClasses = {
    sm: 'p-1 text-sm',
    default: 'p-2',
    lg: 'p-3 text-lg',
  };

  const combinedClassName = [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button onClick={handleLogout} className={combinedClassName} aria-label='Logout'>
      <LogOut className='h-4 w-4' />
      <span className='hidden sm:inline'>Logout</span>
    </button>
  );
}
