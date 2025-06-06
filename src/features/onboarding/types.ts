// Onboarding Feature Types

export interface OnboardingModalWrapperProps {
  userId: string | null;
  userRole: string | null;
}

export interface OnboardingModalContentProps {
  onComplete: () => void;
}
