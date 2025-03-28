'use client';

import { useUser } from '@clerk/nextjs';

import { onboardingSignal } from '../state/onboardingState';

import OnboardingModal from './OnboardingModal';

interface OnboardingModalWrapperProps {
  children: React.ReactNode;
}

export default function OnboardingModalServerWrapper({ children }: OnboardingModalWrapperProps) {
  const { user, isLoaded } = useUser();

  // Check if onboarding is complete based on Clerk's public metadata AND localStorage
  const shouldShowOnboardingModal =
    (isLoaded && user?.publicMetadata?.onboardingComplete !== true) ||
    !onboardingSignal.value.isComplete;

  if (!isLoaded) {
    return null;
  }

  return (
    <>
      {shouldShowOnboardingModal && <OnboardingModal />}
      {children}
    </>
  );
}
