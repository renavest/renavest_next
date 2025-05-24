// src/features/auth/components/auth/ResetPasswordStep.tsx
// components/auth/ResetPasswordStep.tsx
'use client';

import { useSignIn, useUser } from '@clerk/nextjs';
import { useClerk } from '@clerk/nextjs';
import { signal, computed, effect } from '@preact-signals/safe-react';
import { redirect } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import {
  authErrorSignal,
  resetPasswordCode,
  resetPasswordNewPassword,
  currentStep,
} from '../../state/authState'; // Use global error signal
import { OnboardingStep } from '../../types'; // Import props type

export function ResetPasswordStep() {
  const { signIn } = useSignIn();
  const authError = authErrorSignal.value;
  const { setActive } = useClerk();
  const showResetPasswordStep = signal(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { user } = useUser();
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetPasswordCode.value = e.target.value;
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetPasswordNewPassword.value = e.target.value;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    authErrorSignal.value = null;
    setIsResettingPassword(true);
    try {
      if (!signIn) {
        authErrorSignal.value = 'Reset service unavailable.';
        setIsResettingPassword(false);
        return;
      }
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetPasswordCode.value,
        password: resetPasswordNewPassword.value,
      });
      if (result.status === 'complete') {
        setActive({ session: result.createdSessionId });
        showResetPasswordStep.value = true;
        authErrorSignal.value = null;
      }
    } catch {
      authErrorSignal.value = 'Failed to reset password. Please try again.';
      setIsResettingPassword(false);
    }
  };
  const handleBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };
  const handleRedirectToDashboard = () => {
    if (user) {
      if (user.publicMetadata.role === 'employee') {
        redirect('/employee');
      } else if (user.publicMetadata.role === 'employer_admin') {
        redirect('/employer');
      } else if (user.publicMetadata.role === 'therapist') {
        redirect('/therapist');
      }
    }
  };

  // Use useEffect for redirect logic
  useEffect(() => {
    if (showResetPasswordStep.value && user) {
      handleRedirectToDashboard();
    }
  }, [showResetPasswordStep.value, user]);

  // Show spinner/message as soon as the user submits the form (isResettingPassword) or after reset (showResetPasswordStep)
  if (isResettingPassword || showResetPasswordStep.value) {
    return (
      <div className='space-y-6 text-center flex flex-col items-center justify-center min-h-[200px]'>
        <div className='flex justify-center mb-4'>
          <svg
            className='animate-spin h-8 w-8 text-black'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
        </div>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Password Reset Successful</h2>
        <p className='text-gray-600 mb-2'>Signing you in and redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>Reset Your Password</h2>
        <p className='text-gray-600 text-center'>
          Enter the code sent to your email and your new password.
        </p>
      </div>

      {/* Use the global authErrorSignal */}
      {authError && ( // Display error if exists
        <div
          className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in'
          role='alert'
        >
          <span className='block sm:inline'>{authError}</span>
        </div>
      )}

      {/* Use a form element */}
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Input for the code */}
        <div className='space-y-1'>
          <label htmlFor='code' className='block text-sm font-medium text-gray-700 mb-1'>
            Verification Code
          </label>
          <input
            type='text'
            id='code'
            value={resetPasswordCode.value}
            onChange={handleCodeChange}
            required
            inputMode='numeric' // Suggest numeric keyboard on mobile
            autoComplete='one-time-code' // For OTP autofill
            minLength={6} // Clerk codes are typically 6 digits for reset too
            maxLength={6}
            className='block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
            placeholder='Enter the 6-digit code'
          />
        </div>

        {/* Input for the new password */}
        <div className='space-y-1'>
          <label htmlFor='newPassword' className='block text-sm font-medium text-gray-700 mb-1'>
            New Password
          </label>
          <input
            type='password'
            id='newPassword'
            value={resetPasswordNewPassword.value}
            onChange={handlePasswordChange}
            required
            minLength={8} // Ensure password meets Clerk's requirements (default is 8)
            className='block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
            placeholder='Enter your new password'
          />
        </div>

        <button
          type='submit' // Type submit
          className='w-full py-3 px-6 rounded-full shadow-md text-sm font-medium text-white bg-black hover:bg-gray-800 transition-all duration-300 ease-in-out transform'
        >
          Reset Password
        </button>
      </form>

      <div className='text-center mt-4'>
        {/* Option to go back to login */}
        <button
          type='button' // Type button
          onClick={handleBackToLogin}
          className='text-gray-900 hover:underline font-medium p-0 m-0 border-none bg-transparent cursor-pointer'
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
