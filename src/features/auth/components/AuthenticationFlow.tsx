// components/AuthenticationFlow.tsx
'use client';

import React, { useEffect } from 'react';

import { currentStep, authErrorSignal } from '../state/authState';
import { OnboardingStep } from '../types';

import { EmailVerificationStep } from './auth/EmailVerification';
import { ForgotPasswordStep } from './auth/ForgotPassword';
import { LoginStep } from './auth/Login';
import { ResetPasswordStep } from './auth/ResetPassword';
import { RoleSelectionStep } from './auth/RoleSelection';
import { SignupStep } from './auth/Signup';
import { AgeRangeStep } from './onboarding/AgeRange';
import { EthnicityStep } from './onboarding/Ethnicity';
import { MaritalStatusStep } from './onboarding/MaritalStatus';
import { PrivacyPledgeStep } from './onboarding/PrivacyPledge';
import { RenavestPurposeStep } from './onboarding/Purpose';

export default function AuthenticationFlow() {
  // Add useEffect to reset authErrorSignal when currentStep changes
  useEffect(() => {
    authErrorSignal.value = null;
  }, [currentStep.value]);

  function AuthErrorMessage() {
    if (!authErrorSignal.value) return null;

    // Check if this is an existing account error
    const isExistingAccountError =
      authErrorSignal.value.includes('already exists') ||
      authErrorSignal.value.includes('already connected') ||
      authErrorSignal.value.includes('already signed in');

    const handleSignInRedirect = () => {
      currentStep.value = OnboardingStep.LOGIN;
      authErrorSignal.value = null;
    };

    return (
      <div
        className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in'
        role='alert'
      >
        <span className='block sm:inline'>{authErrorSignal.value}</span>
        {isExistingAccountError && (
          <div className='mt-2'>
            <button
              type='button'
              onClick={handleSignInRedirect}
              className='text-red-800 hover:text-red-900 underline font-medium text-sm'
            >
              Sign in to your existing account →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Step navigation logic
  const renderCurrentStep = () => {
    switch (currentStep.value) {
      case OnboardingStep.LOGIN:
        return <LoginStep />;
      case OnboardingStep.ROLE_SELECTION:
        return <RoleSelectionStep />;
      case OnboardingStep.PURPOSE:
        return <RenavestPurposeStep />;
      case OnboardingStep.AGE_RANGE:
        return <AgeRangeStep />;
      case OnboardingStep.MARITAL_STATUS:
        return <MaritalStatusStep />;
      case OnboardingStep.ETHNICITY:
        return <EthnicityStep />;
      case OnboardingStep.PRIVACY_PLEDGE:
        return <PrivacyPledgeStep />;
      case OnboardingStep.SIGNUP:
        return <SignupStep />;
      case OnboardingStep.EMAIL_VERIFICATION:
        return <EmailVerificationStep />;
      case OnboardingStep.FORGOT_PASSWORD:
        return <ForgotPasswordStep />;
      case OnboardingStep.RESET_PASSWORD:
        return <ResetPasswordStep />;
      default:
        return <LoginStep />;
    }
  };

  return (
    <div className='space-y-6 w-full max-w-lg mx-auto flex flex-col min-h-full justify-center py-12'>
      <AuthErrorMessage />
      {renderCurrentStep()}
    </div>
  );
}
