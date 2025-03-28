'use client';

import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { clearOnboardingState } from '@/src/features/onboarding/state/onboardingState';

interface LogoutButtonProps {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  showText?: boolean;
}

export function LogoutButton({
  className = 'flex items-center space-x-2 text-gray-700 hover:bg-gray-100 p-2 rounded-md',
  textClassName = 'hidden sm:inline',
  iconClassName = 'h-4 w-4',
  showText = true,
}: LogoutButtonProps) {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      clearOnboardingState();
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <button onClick={handleLogout} className={className} aria-label='Logout'>
      <LogOut className={iconClassName} />
      {showText && <span className={textClassName}>Logout</span>}
    </button>
  );
}
