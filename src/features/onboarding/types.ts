// Onboarding Feature Types

export interface OnboardingModalWrapperProps {
  userId: string | null;
  userRole: string | null;
}

export interface OnboardingModalContentProps {
  _clerkUser: { id?: string };
  currentStep: number;
  currentQuestion: OnboardingQuestion;
  isFirstQuestion: boolean;
  isLastStep: boolean;
  selectedAnswers: Record<number, string[]>;
  handleOptionSelect: (optionId: string) => void;
  handleNext: () => void;
  handleClose: () => void;
  isSubmitting: boolean;
  progress: number;
}

export interface OnboardingQuestion {
  id: number;
  question: string;
  type: 'single' | 'multiple' | 'dropdown';
  description?: string;
  supportiveText?: string;
  options: OnboardingOption[];
}

export interface OnboardingOption {
  id: string;
  label: string;
}
