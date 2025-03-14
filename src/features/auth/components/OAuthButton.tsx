import { useSignIn } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';
import * as React from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

interface OAuthButtonProps {
  strategy: OAuthStrategy;
  icon: React.ReactNode;
  label: string;
}

export function OAuthButton({ strategy, icon, label }: OAuthButtonProps) {
  const { signIn } = useSignIn();

  if (!signIn) return null;

  const signInWith = () => {
    return signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-up/sso-callback',
        redirectUrlComplete: '/',
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err: unknown) => {
        console.error(err, null, 2);
      });
  };

  return (
    <button
      type='button'
      onClick={signInWith}
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
