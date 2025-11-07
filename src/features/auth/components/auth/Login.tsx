// src/features/auth/components/auth/Login.tsx
'use client';

import { useClerk, useUser, useSignIn } from '@clerk/nextjs';
import React, { useState, useEffect } from 'react';

import {
  trackAuthPageView,
  trackLoginAttempt,
  trackLoginSuccess,
  trackLoginError,
  identifyAuthenticatedUser,
} from '@/src/features/auth/utils/authTracking';

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

// Development diagnostic component
const ClerkDiagnostics = () => {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const [domain, setDomain] = React.useState('Loading...');

  // Fix hydration mismatch by using useEffect to set domain on client-side only
  React.useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs'>
      <h4 className='font-semibold text-yellow-800 mb-2'>🔧 Development Diagnostics</h4>
      <div className='space-y-1 text-yellow-700'>
        <div>
          Publishable Key: {publishableKey ? `${publishableKey.slice(0, 20)}...` : '❌ Missing'}
        </div>
        <div>Environment: {process.env.NODE_ENV}</div>
        <div>Domain: {domain}</div>
      </div>
    </div>
  );
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

// Enhanced password input component with view toggle
const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = true,
  rightAction,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rightAction?: React.ReactNode;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='space-y-1'>
      <div className='flex justify-between items-center'>
        <label htmlFor={id} className='block text-sm font-medium text-gray-700 mb-1'>
          {label}
        </label>
        {rightAction}
      </div>
      <div className='relative'>
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className='block w-full px-4 py-2 pr-12 rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-200 focus:ring-opacity-50 transition duration-300'
          placeholder={placeholder}
        />
        <button
          type='button'
          onClick={() => setShowPassword(!showPassword)}
          className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200'
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
              />
            </svg>
          ) : (
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className='inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
);

export function LoginStep() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Logging you in...');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { signIn } = useSignIn();
  const { user } = useUser();
  const { setActive } = useClerk();
  const { redirectToRole } = useRoleBasedRedirect();

  // Track page view on component mount
  useEffect(() => {
    trackAuthPageView('login');
  }, []);

  // Check for signup action in URL and redirect to signup flow
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'signup') {
      currentStep.value = OnboardingStep.PURPOSE;
    }
  }, []);

  // Handle redirect after successful login when user becomes available
  useEffect(() => {
    if (loginSuccess && user) {
      // Track successful login
      trackLoginSuccess('email_password', (user.publicMetadata?.role as string) || 'unknown', {
        email_domain: email.value.split('@')[1],
      });

      // Identify user in PostHog
      identifyAuthenticatedUser(
        user.id,
        user.emailAddresses[0]?.emailAddress || email.value,
        (user.publicMetadata?.role as string) || 'unknown',
        user.publicMetadata?.companyId as string,
        user.publicMetadata?.companyName as string,
      );

      // Update loading message and redirect
      setLoadingMessage('Redirecting to your dashboard...');
      redirectToRole(user);
    } else if (loginSuccess && !user) {
      // User not yet available, show different message
      setLoadingMessage('Loading your profile...');
    }
  }, [loginSuccess, user, redirectToRole]);

  // Fallback timeout for when user object takes too long to load
  useEffect(() => {
    if (loginSuccess) {
      const timeout = setTimeout(() => {
        if (!user) {
          console.log('User object not available after timeout, redirecting to auth-check');
          setLoadingMessage('Setting up your session...');
          window.location.href = '/auth-check';
        }
      }, 3000); // 3 second timeout

      return () => clearTimeout(timeout);
    }
  }, [loginSuccess, user]);

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
    setLoadingMessage('Logging you in...');

    // Track login attempt
    trackLoginAttempt('email_password', {
      email_domain: email.value.split('@')[1],
    });

    try {
      if (signIn) {
        const result = await signIn.create({
          identifier: email.value,
          password: password.value,
        });

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });

          // Update loading message and set success flag
          setLoadingMessage('Preparing your dashboard...');
          setLoginSuccess(true);

          // Don't set loading to false - the useEffect will handle redirect
          return;
        }
      }
    } catch (error) {
      // Track login error
      trackLoginError('email_password', error, {
        email_domain: email.value.split('@')[1],
      });

      console.error('Login failed', error);

      // More detailed error handling
      let errorMessage = 'Login failed. Please try again.';

      if (error && typeof error === 'object' && 'errors' in error) {
        const clerkErrors = (error as { errors: Array<{ code?: string; message?: string }> })
          .errors;
        const clerkError = clerkErrors[0];
        if (clerkError?.code === 'form_identifier_not_found') {
          errorMessage =
            'No account found with this email address. Please check your email or sign up for a new account.';
        } else if (clerkError?.code === 'form_password_incorrect') {
          errorMessage =
            'Incorrect password. Please try again or use "Forgot password?" to reset it.';
        } else if (clerkError?.code === 'form_identifier_exists_') {
          errorMessage =
            'This email is associated with a social login. Please sign in using your social account.';
        } else if (clerkError?.message) {
          errorMessage = clerkError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      authErrorSignal.value = errorMessage;

      // Only set loading false on error, not on success
      setIsLoading(false);
    }
  };

  // Handler for navigating to signup
  const onSignupClick = () => {
    currentStep.value = OnboardingStep.PURPOSE;
  };

  // Handler for forgot password
  const onForgotPasswordClick = () => {
    currentStep.value = OnboardingStep.FORGOT_PASSWORD;
  };

  return (
    <div className='space-y-6 relative'>
      {/* Loading Overlay */}
      {isLoading && (
        <div className='absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center'>
          <div className='bg-white rounded-lg p-6 shadow-lg flex flex-col items-center space-y-3'>
            <div className='animate-spin rounded-full h-8 w-8 border-4 border-purple-100 border-t-purple-600'></div>
            <p className='text-sm text-gray-600 font-medium'>{loadingMessage}</p>
          </div>
        </div>
      )}

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

        <PasswordInput
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
          className='w-full py-3 px-6 rounded-full shadow-md text-sm font-medium text-white bg-black hover:bg-gray-800 transition-all duration-300 ease-in-out transform disabled:opacity-50 flex items-center justify-center gap-2'
        >
          {isLoading && <LoadingSpinner />}
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

      <ClerkDiagnostics />
    </div>
  );
}
