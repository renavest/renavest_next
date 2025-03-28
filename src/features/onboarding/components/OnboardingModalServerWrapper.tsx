'use client';

import { useUser } from '@clerk/nextjs';

import OnboardingModal from './OnboardingModal';

interface OnboardingModalWrapperProps {
  children: React.ReactNode;
}

export default function OnboardingModalServerWrapper({ children }: OnboardingModalWrapperProps) {
  const { user, isLoaded } = useUser();

  // Check if onboarding is complete based on Clerk's public metadata
  const shouldShowOnboardingModal = isLoaded && user?.publicMetadata?.onboardingComplete !== true;

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
