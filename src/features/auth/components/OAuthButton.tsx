import { useSignIn, useUser } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';
import posthog from 'posthog-js';
import * as React from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import {
  authErrorSignal,
  getSelectedRole,
  selectedRoleSignal,
  setUserType,
} from '../state/authState';

interface OAuthButtonProps {
  strategy: OAuthStrategy;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

export default function OAuthButton({ strategy, icon, label, disabled = false }: OAuthButtonProps) {
  const { signIn, setActive } = useSignIn();
  const { user } = useUser();

  const handleOAuthSignIn = async () => {
    if (!signIn) return;

    try {
      const result = await signIn.create({
        strategy,
        redirectUrl: '/sign-up/sso-callback',
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });

        // Identify user with PostHog
        const selectedRole = getSelectedRole() || selectedRoleSignal.value;

        posthog.identify(user?.id, {
          email: user?.emailAddresses[0]?.emailAddress,
          name: user?.fullName,
          user_type: selectedRole,
          oauth_strategy: strategy,
          first_login: true,
        });

        // Capture login event
        posthog.capture('user_login', {
          user_id: user?.id,
          login_method: strategy,
          user_type: selectedRole,
        });

        // Set user type if selected
        if (selectedRole) {
          setUserType(selectedRole);
        }
      }
    } catch (error: unknown) {
      console.error('OAuth Sign In Error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred during sign in';

      authErrorSignal.value = errorMessage;

      // Track login failure
      posthog.capture('user_login_failed', {
        login_method: strategy,
        error_message: errorMessage,
      });
    }
  };

  return (
    <button
      type='button'
      onClick={handleOAuthSignIn}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-center py-3 rounded-lg transition-all duration-200 border',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : `${COLORS.WARM_PURPLE.border} hover:${COLORS.WARM_PURPLE.hoverBorder} hover:bg-gray-50`,
      )}
    >
      <div className='flex items-center space-x-2'>
        {icon}
        <span className='text-sm font-medium'>Continue with {label}</span>
      </div>
    </button>
  );
}
