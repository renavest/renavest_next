import { useSignIn, useClerk } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';
import posthog from 'posthog-js';
import * as React from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { authErrorSignal, selectedRoleSignal } from '../state/authState';

interface OAuthButtonProps {
  strategy: OAuthStrategy;
  icon: React.ReactNode;
  label: string;
}

export function OAuthButton({ strategy, icon, label }: OAuthButtonProps) {
  const { signIn, isLoaded } = useSignIn();
  const clerk = useClerk();

  const handleOAuthSignIn = async () => {
    if (!selectedRoleSignal.value) {
      authErrorSignal.value = 'Please select a role before continuing';
      return;
    }

    try {
      if (!isLoaded || !signIn) {
        authErrorSignal.value = 'Authentication system is not ready';
        return;
      }

      // Sign out of any existing session before OAuth sign-in
      await clerk.signOut();

      // Capture login attempt
      posthog.capture('user_login_attempt', {
        method: strategy,
        role: selectedRoleSignal.value,
      });
      const redirectUrlComplete =
        selectedRoleSignal.value === 'employee'
          ? '/employee'
          : selectedRoleSignal.value === 'therapist'
            ? '/therapist'
            : selectedRoleSignal.value === 'employer'
              ? '/employer'
              : '/employee';
      // Authenticate with redirect and pass role in redirectUrl
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `/sign-up/sso-callback`,
        redirectUrlComplete,
      });
    } catch (err) {
      console.error('OAuth error:', err);
      authErrorSignal.value = 'Failed to sign in. Please try again.';
    }
  };

  return (
    <button
      type='button'
      onClick={handleOAuthSignIn}
      disabled={!isLoaded}
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
