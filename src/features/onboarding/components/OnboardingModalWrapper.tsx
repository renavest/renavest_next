'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import OnboardingModal from './OnboardingModal';

interface OnboardingModalWrapperProps {
  userId: string | null;
}

export default function OnboardingModalWrapper({ userId }: OnboardingModalWrapperProps) {
  const { user, isLoaded } = useUser();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      // Check if onboarding is complete in Clerk metadata
      const isOnboardingComplete = user.publicMetadata?.onboardingComplete;

      // Show modal if onboarding is not complete and user is not a "seth" user
      setShowModal(
        !isOnboardingComplete && !user.emailAddresses[0]?.emailAddress?.includes('seth'),
      );
    }
  }, [user, isLoaded]);

  if (!isLoaded || !userId) {
    return null;
  }

  return showModal ? <OnboardingModal /> : null;
}
