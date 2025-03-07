'use client';
import React from 'react';

import { authSignal, updateAuthEmail, updateAuthCode } from '../state/authSignals';

import VerificationCode from './VerificationCode';

export default function EmailVerificationInput() {
  const auth = authSignal.value;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    updateAuthEmail(newEmail);
  };

  return (
    <>
      <div>
        <label className='block text-sm font-medium mb-2'>Company email</label>
        <input
          type='email'
          className='w-full px-4 py-3 rounded-lg border bg-background'
          value={auth.email}
          onChange={handleEmailChange}
          placeholder='you@companyemail.com'
        />
      </div>

      <div>
        <label className='block text-sm font-medium mb-2'>Verification code</label>
        <VerificationCode value={auth.code} onChange={updateAuthCode} />
      </div>
    </>
  );
}
