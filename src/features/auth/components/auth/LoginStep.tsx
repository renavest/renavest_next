// src/features/auth/components/auth/LoginStep.tsx
// components/auth/LoginStep.tsx
'use client';

import { useClerk, useUser, useSignIn } from '@clerk/nextjs';
import React, { useState } from 'react';

import {
  email,
  password,
  authErrorSignal,
  currentStep,
  // Add any needed handler functions from authState or define here
} from '../../state/authState';
import { OnboardingStep } from '../../types';
import { useRoleBasedRedirect } from '../../utils/routerUtil';

// Validation utility
const validateEmail = (emailValue: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailValue);
};

// Input component for better reusability and control
const FormInput = ({
  type,
  id,
  label,
  value,
  onChange,
  placeholder,
  required = true,
  rightAction,
}: {
  type: string;
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rightAction?: React.ReactNode;
}) => (
  <div className='space-y-1'>
    <div className='flex justify-between items-center'>
      <label htmlFor={id} className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
      {rightAction}
    </div>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className='block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
      placeholder={placeholder}
    />
  </div>
);

export function LoginStep() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useSignIn();
  const { user } = useUser();
  const { setActive } = useClerk();
  const { redirectToRole } = useRoleBasedRedirect();

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    authErrorSignal.value = null;

    // Validate inputs before submission
    if (!validateEmail(email.value)) {
      authErrorSignal.value = 'Please enter a valid email address';
      return;
    }

    if (password.value.length < 6) {
      authErrorSignal.value = 'Password must be at least 6 characters long';
      return;
    }

    setIsLoading(true);
    try {
      if (signIn) {
        const result = await signIn.create({
          identifier: email.value,
          password: password.value,
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });

          if (user) {
            redirectToRole(user);
          }
        }
      }
    } catch (error) {
      // More detailed error handling
      if (error instanceof Error) {
        authErrorSignal.value = error.message || 'Login failed. Please try again.';
      }
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for navigating to signup
  const onSignupClick = () => {
    currentStep.value = OnboardingStep.ROLE_SELECTION;
  };

  // Handler for forgot password
  const onForgotPasswordClick = () => {
    currentStep.value = OnboardingStep.FORGOT_PASSWORD;
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-4 text-center'>Welcome to Renavest</h2>
      </div>

      <form onSubmit={onLogin} className='space-y-4'>
        <FormInput
          type='email'
          id='email'
          label='Email'
          value={email.value}
          onChange={(value) => (email.value = value)}
          placeholder='you@example.com'
        />

        <FormInput
          type='password'
          id='password'
          label='Password'
          value={password.value}
          onChange={(value) => (password.value = value)}
          placeholder='Enter your password'
          rightAction={
            <button
              type='button'
              onClick={onForgotPasswordClick}
              className='text-sm text-gray-900 hover:underline p-0 m-0 border-none bg-transparent cursor-pointer'
            >
              Forgot password?
            </button>
          }
        />

        <button
          type='submit'
          disabled={isLoading}
          className='w-full py-3 px-6 rounded-full shadow-md text-sm font-medium text-white bg-black hover:bg-gray-800 transition-all duration-300 ease-in-out transform disabled:opacity-50'
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className='text-center mt-4'>
        <p className='text-sm text-gray-600'>
          Don't have an account?{' '}
          <button
            type='button'
            onClick={onSignupClick}
            className='text-gray-900 hover:underline font-medium p-0 m-0 border-none bg-transparent cursor-pointer'
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
