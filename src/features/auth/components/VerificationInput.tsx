'use client';
import { useStore } from '@nanostores/react';
import React from 'react';

import { $auth, updateEmail, updateCode } from '../stores';
import { emailSignal } from '../utils/emailState';

import VerificationCode from './VerificationCode';

export default function VerificationInput() {
  const auth = useStore($auth);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    updateEmail(newEmail);
    emailSignal.value = newEmail;
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
        <VerificationCode value={auth.code} onChange={updateCode} />
      </div>
    </>
  );
}
