// components/AuthenticationFlow.tsx
'use client';

import React from 'react';

import { currentStep, authErrorSignal } from '../state/authState';
import { OnboardingStep } from '../types';

import { EmailVerificationStep } from './auth/EmailVerificationStep';
import { ForgotPasswordStep } from './auth/ForgotPasswordStep';
import { LoginStep } from './auth/LoginStep';
import { ResetPasswordStep } from './auth/ResetPasswordStep';
import { RoleSelectionStep } from './auth/RoleSelectionStep';
import { SignupStep } from './auth/SignupStep';
import { AgeRangeStep } from './onboarding/AgeRangeStep';
import { EthnicityStep } from './onboarding/EthnicityStep';
import { MaritalStatusStep } from './onboarding/MaritalStatusStep';
import { RenavestPurposeStep } from './onboarding/PurposeStep';
export default function AuthenticationFlow() {
  function AuthErrorMessage() {
    if (!authErrorSignal.value) return null;
    return (
      <div
        className='bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative animate-fade-in'
        role='alert'
      >
        <span className='block sm:inline'>{authErrorSignal.value}</span>
      </div>
    );
  }

  // Step navigation logic
  const renderCurrentStep = () => {
    // Reset auth error signal before rendering each step
    authErrorSignal.value = null;

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
