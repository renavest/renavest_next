'use client';

import { useEffect } from 'react';

import OnboardingModal from '@/src/features/onboarding/components/OnboardingModal';
import { onboardingSignal } from '@/src/features/onboarding/state/onboardingState';

export default function EmployeePage() {
  // Force show the onboarding modal on this page
  useEffect(() => {
    onboardingSignal.value = {
      isComplete: false,
      currentStep: 0,
      answers: {},
    };
  }, []);

  return (
    <div className='min-h-screen bg-gray-50'>
      <OnboardingModal />
      <div className='container mx-auto px-6 py-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Employee Dashboard</h1>
      </div>
    </div>
  );
}
