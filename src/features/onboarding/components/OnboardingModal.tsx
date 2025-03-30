'use client';

import { useClerk } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useState } from 'react';

import { useOnboardingSubmission } from '../hooks/useOnboardingSubmission';
import { onboardingSignal, onboardingQuestions } from '../state/onboardingState';

import { OnboardingModalContent } from './OnboardingModalContent';

export default function OnboardingModal() {
  const { user: clerkUser } = useClerk();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>(
    () => onboardingSignal.value.answers,
  );

  const signalState = onboardingSignal.value;
  const { handleSubmit, isSubmitting } = useOnboardingSubmission();

  const currentStep = signalState.currentStep;
  const currentQuestion = onboardingQuestions[currentStep];
  const progress = ((currentStep + 1) / onboardingQuestions.length) * 100;
  const isLastStep = currentStep === onboardingQuestions.length - 1;
  const isFirstQuestion = currentStep === 0;

  const handleOptionSelect = (optionId: string) => {
    setSelectedAnswers((prev) => {
      const questionId = currentQuestion.id;

      // Track option selection
      posthog.capture('onboarding_step_interaction', {
        user_id: clerkUser?.id,
        question_id: questionId,
        selected_option: optionId,
        question_type: currentQuestion.type,
        is_multi_select: currentQuestion.multiSelect || false,
      });

      if (currentQuestion.multiSelect) {
        const current = prev[questionId] || [];
        const updated = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: updated };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleNext = () => {
    const nextStep = currentStep + 1;
    const isLastStep = nextStep >= onboardingQuestions.length;

    // Track progress through onboarding steps
    posthog.capture('onboarding_step_progress', {
      user_id: clerkUser?.id,
      current_step: currentStep,
      total_steps: onboardingQuestions.length,
      question_id: currentQuestion.id,
      selected_answers: selectedAnswers[currentQuestion.id] || [],
    });

    if (isLastStep) {
      handleSubmit(selectedAnswers, currentStep);
    } else {
      onboardingSignal.value = {
        isComplete: false,
        currentStep: nextStep,
        answers: { ...selectedAnswers },
      };
    }
  };

  const handleClose = () => {
    // Track if user closes onboarding prematurely
    posthog.capture('onboarding_abandoned', {
      user_id: clerkUser?.id,
      current_step: currentStep,
      total_steps: onboardingQuestions.length,
      progress_percentage: ((currentStep + 1) / onboardingQuestions.length) * 100,
    });

    onboardingSignal.value = {
      ...onboardingSignal.value,
      isComplete: true,
    };
  };

  return (
    <OnboardingModalContent
      _clerkUser={{ id: clerkUser?.id }}
      currentStep={currentStep}
      currentQuestion={currentQuestion}
      isFirstQuestion={isFirstQuestion}
      isLastStep={isLastStep}
      selectedAnswers={selectedAnswers}
      handleOptionSelect={handleOptionSelect}
      handleNext={handleNext}
      handleClose={handleClose}
      isSubmitting={isSubmitting}
      progress={progress}
    />
  );
}
