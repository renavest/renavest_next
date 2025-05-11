'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import OnboardingModal from './OnboardingModal';

interface OnboardingModalWrapperProps {
  userId: string | null;
}

export default function OnboardingModalWrapper({ userId }: OnboardingModalWrapperProps) {
  const { user, isLoaded } = useUser();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      // Check if onboarding is complete in Clerk metadata or if role is missing
      const isOnboardingComplete = user.publicMetadata?.onboardingComplete;
      const hasRole = !!user.publicMetadata?.role;
      if (!hasRole) {
        toast.info('Please complete onboarding to continue.');
      }
      // Show modal if onboarding is not complete or role is missing and user is not a "seth" user
      setShowModal(
        (!isOnboardingComplete || !hasRole) &&
          !user.emailAddresses[0]?.emailAddress?.includes('seth'),
      );
    }
  }, [user, isLoaded]);

  if (!isLoaded || !userId) {
    return null;
  }

  return showModal ? <OnboardingModal /> : null;
}
