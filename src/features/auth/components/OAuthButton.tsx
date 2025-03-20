import { OAuthStrategy } from '@clerk/types';
import * as React from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { selectedRoleSignal } from '../state/authState';
import { setMockUserRole } from '../utils/mockAuth';

interface OAuthButtonProps {
  strategy: OAuthStrategy;
  icon: React.ReactNode;
  label: string;
}

export function OAuthButton({ icon, label }: Omit<OAuthButtonProps, 'strategy'>) {
  const handleOAuthSignIn = async () => {
    if (!selectedRoleSignal.value) {
      return;
    }

    try {
      // Set the mock user's role
      setMockUserRole(selectedRoleSignal.value);

      // Redirect to the appropriate dashboard
      window.location.href = `/${selectedRoleSignal.value === 'employer' ? 'employer' : selectedRoleSignal.value === 'therapist' ? 'therapist' : ''}/dashboard`;
    } catch (err) {
      console.error('OAuth error:', err);
    }
  };

  return (
    <button
      type='button'
      onClick={handleOAuthSignIn}
      className={cn(
        'w-full border-2 text-gray-900 rounded-lg h-11 font-medium transition-colors flex items-center justify-center',
        COLORS.WARM_PURPLE[20],
        COLORS.WARM_PURPLE[5],
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export default OAuthButton;
