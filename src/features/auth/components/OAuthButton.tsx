import { useSignIn, useUser } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';
import posthog from 'posthog-js';
import * as React from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { authErrorSignal, selectedRoleSignal, setUserType } from '../state/authState';

interface OAuthButtonProps {
  strategy: OAuthStrategy;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

export function OAuthButton({ strategy, icon, label, disabled }: OAuthButtonProps) {
  const { signIn, isLoaded } = useSignIn();
  const { user } = useUser();

  const handleOAuthSignIn = async () => {
    if (!isLoaded) return;
    if (!selectedRoleSignal.value) {
      authErrorSignal.value = 'Please select a role before signing in';
      return;
    }

    try {
      // Determine redirect URL based on selected role
      const redirectUrlComplete =
        selectedRoleSignal.value === 'employee'
          ? '/employee'
          : selectedRoleSignal.value === 'therapist'
            ? '/therapist'
            : selectedRoleSignal.value === 'employer'
              ? '/employer'
              : '/dashboard';

      // Track OAuth redirect with detailed information
      posthog.capture('user_signup_oauth_redirect', {
        method: strategy,
        role: selectedRoleSignal.value,
        redirect_url: '/sign-up/sso-callback',
        redirect_url_complete: redirectUrlComplete,
        user_id: user?.id || 'anonymous',
        email: user?.emailAddresses[0]?.emailAddress || 'unknown',
      });

      // Authenticate with redirect and pass role in redirectUrl
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-up/sso-callback',
        redirectUrlComplete,
      });

      // Capture initial signup attempt with role
      posthog.capture('user_signup_attempt', {
        role: selectedRoleSignal.value,
        oauth_method: strategy,
      });
    } catch (err) {
      console.error('OAuth error:', err);
      authErrorSignal.value = 'Failed to sign in. Please try again.';

      // Ensure email is captured even in error scenarios
      const userEmail = user?.emailAddresses[0]?.emailAddress || 'unknown';

      // Track OAuth signup error with comprehensive context
      posthog.capture('user_signup_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
        role: selectedRoleSignal.value,
        signup_stage: 'oauth_exception',
        oauth_method: strategy,
        user_id: user?.id || 'anonymous',
        email: userEmail,
      });

      // Fallback tracking to ensure email is always present
      posthog.identify(userEmail, {
        email: userEmail,
        role: selectedRoleSignal.value,
        signup_error: true,
      });
    }
  };

  return (
    <button
      type='button'
      onClick={handleOAuthSignIn}
      disabled={!isLoaded || disabled}
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
