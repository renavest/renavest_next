// src/features/auth/components/auth/ForgotPasswordStep.tsx
// components/auth/ForgotPasswordEmailStep.tsx
'use client';

import { useSignIn } from '@clerk/nextjs';
import React from 'react';

// Removed direct signal import, use global signal instead
import { authErrorSignal, forgotPasswordEmailAddress, currentStep } from '../../state/authState';
import { OnboardingStep } from '../../types';

export function ForgotPasswordStep() {
  const { signIn } = useSignIn();
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    forgotPasswordEmailAddress.value = e.target.value;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    authErrorSignal.value = null;
    try {
      if (!signIn) {
        authErrorSignal.value = 'Password reset service unavailable.';
        return;
      }
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: forgotPasswordEmailAddress.value,
      });
      currentStep.value = OnboardingStep.RESET_PASSWORD;
    } catch {
      authErrorSignal.value = 'Failed to send reset email. Please try again.';
    }
  };
  const handleBackToLogin = () => {
    currentStep.value = OnboardingStep.LOGIN;
  };
  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>Forgot Your Password?</h2>
        <p className='text-gray-600 text-center'>
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Use a form element */}
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-1'>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
            Email
          </label>
          <input
            type='email'
            id='email'
            value={forgotPasswordEmailAddress.value}
            onChange={handleEmailChange}
            required
            className='block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
            placeholder='Enter your email address'
          />
        </div>

        <button
          type='submit' // Type submit
          className='w-full py-3 px-6 rounded-full shadow-md text-sm font-medium text-white bg-black hover:bg-gray-800 transition-all duration-300 ease-in-out transform'
        >
          Send Reset Link
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
