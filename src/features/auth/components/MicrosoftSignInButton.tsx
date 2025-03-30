'use client';

import * as React from 'react';

import { OAuthButton } from './OAuthButton';

export default function MicrosoftSignInButton() {
  const microsoftIcon = (
    <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
      <path d='M3 3h18v18H3V3z' fill='#F25022' />
      <path d='M3 3h9v9H3V3z' fill='#00A4EF' />
      <path d='M12 3h9v9h-9V3z' fill='#7FBA00' />
      <path d='M3 12h9v9H3v-9z' fill='#FFB900' />
    </svg>
  );

  return (
    <OAuthButton
      disabled={true}
      strategy='oauth_microsoft'
      icon={microsoftIcon}
      label='Sign in with Microsoft'
    />
  );
}
