import { useSignIn, useUser } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';
import * as React from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { authErrorSignal, selectedRoleSignal, getCompanyIntegration } from '../state/authState';
import { UserType } from '../types/auth';
import {
  trackLoginAttempt,
  trackLoginError,
  trackOAuthRedirect,
  trackSignupAttempt,
} from '../utils/authTracking';

interface OAuthButtonProps {
  strategy: OAuthStrategy;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

export function OAuthButton({ strategy, icon, label, disabled }: OAuthButtonProps) {
  const { signIn, isLoaded } = useSignIn();
  const { user } = useUser();
  // Prefer Clerk metadata, fallback to selectedRoleSignal
  const userRole = user?.publicMetadata?.role || selectedRoleSignal.value;
  const company = getCompanyIntegration();

  const handleOAuthSignIn = async () => {
    if (!userRole) {
      authErrorSignal.value = 'Please select a role first.';
      return;
    }

    try {
      if (!isLoaded) {
        return;
      }

      // Determine redirect URL based on selected role
      const redirectUrlComplete = userRole === 'employee' ? '/employee' : `/${userRole}`;

      // Get provider name for tracking
      const provider = strategy === 'oauth_google' ? 'google' : 'microsoft';

      // Track OAuth redirect with detailed information
      trackOAuthRedirect(provider as 'google' | 'microsoft', {
        role: userRole as UserType,
        company: company || undefined,
        userId: user?.id,
        email: user?.emailAddresses[0]?.emailAddress,
      });
      localStorage.setItem('role_from_oauth', userRole.toString());

      console.log('redirectUrlComplete', redirectUrlComplete);
      console.log('userRole', userRole);

      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete,
        // Since additionalData isn't recognized, we'll need to use Clerk metadata later
      });

      // Track login/signup attempt
      const isExistingUser = !!user?.id;
      if (isExistingUser) {
        trackLoginAttempt(provider as 'google' | 'microsoft', {
          role: userRole as UserType,
          company: company || undefined,
          userId: user?.id,
          email: user?.emailAddresses[0]?.emailAddress,
        });
      } else {
        trackSignupAttempt(provider as 'google' | 'microsoft', {
          role: userRole as UserType,
          company: company || undefined,
        });
      }
    } catch (err) {
      console.error('OAuth error:', err);
      authErrorSignal.value = 'Failed to sign in. Please try again.';

      // Get provider name for tracking
      const provider = strategy === 'oauth_google' ? 'google' : 'microsoft';

      // Track OAuth error
      trackLoginError(provider as 'google' | 'microsoft', err, {
        role: userRole as UserType,
        company: company || undefined,
        userId: user?.id,
        email: user?.emailAddresses[0]?.emailAddress,
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
