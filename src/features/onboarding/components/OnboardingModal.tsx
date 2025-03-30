'use client';

import { useClerk } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useState } from 'react';
import { toast } from 'sonner';

import { ALLOWED_EMAILS } from '@/src/constants';
import { COLORS } from '@/src/styles/colors';

import { submitOnboardingData } from '../actions/onboardingActions';
import {
  OnboardingQuestion,
  onboardingQuestions,
  onboardingSignal,
} from '../state/onboardingState';

interface OnboardingContentProps {
  currentQuestion: OnboardingQuestion;
  selectedAnswers: Record<number, string[]>;
  onOptionSelect: (optionId: string) => void;
  onNext: () => void;
  isLastStep: boolean;
  canProceed: boolean;
  isSubmitting: boolean;
}

interface LeftSideContentProps {
  isFirstQuestion: boolean;
  currentQuestion: OnboardingQuestion;
  currentStep: number;
}

function LeftSideContent({ isFirstQuestion, currentQuestion, currentStep }: LeftSideContentProps) {
  return (
    <div className='w-full md:w-5/12 p-4 md:p-8 flex flex-col'>
      {isFirstQuestion ? (
        <>
          <h1 className='text-2xl md:text-4xl font-semibold text-gray-900 mb-2 md:mb-4'>
            Let's get to know you better
          </h1>
          <div className='space-y-2 md:space-y-4'>
            <p className='text-sm md:text-base text-gray-600'>
              Your financial journey is unique, and we're here to support you every step of the way.
            </p>
            <p className='text-sm md:text-base text-gray-600'>
              By understanding you better, we can match you with a financial therapist who truly
              gets you and your needs.
            </p>
            <p className='text-xs md:text-sm text-gray-600 italic'>
              All your responses are confidential and help us provide personalized support.
            </p>
          </div>
        </>
      ) : (
        <div className='space-y-2 md:space-y-4'>
          {currentQuestion.title && (
            <h2 className='text-xs md:text-sm uppercase tracking-wider text-gray-500'>
              {currentQuestion.title}
            </h2>
          )}
          <h3 className='text-xl md:text-3xl font-semibold text-gray-900'>
            {currentQuestion.question}
          </h3>
          {currentQuestion.supportiveText && (
            <p className='text-sm md:text-base text-gray-600'>{currentQuestion.supportiveText}</p>
          )}
        </div>
      )}

      {/* Progress dots */}
      <div className='mt-4 md:mt-auto space-y-1 md:space-y-2'>
        <p className='text-xs md:text-sm text-gray-500'>
          Question {currentStep + 1} of {onboardingQuestions.length}
        </p>
        <div className='flex gap-1 md:gap-2'>
          {onboardingQuestions.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 md:h-2 w-1.5 md:w-2 rounded-full transition-colors ${
                index === currentStep ? `${COLORS.WARM_PURPLE.bg}` : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OnboardingContent({
  currentQuestion,
  selectedAnswers,
  onOptionSelect,
  onNext,
  isLastStep,
  canProceed,
  isSubmitting,
}: OnboardingContentProps) {
  const isOptionSelected = (optionId: string) =>
    (selectedAnswers[currentQuestion.id] || []).includes(optionId);

  const selectedValue = selectedAnswers[currentQuestion.id]?.[0] || '';

  return (
    <div className={`w-full ${COLORS.WARM_PURPLE['5']} p-4 md:p-8 flex flex-col min-h-full`}>
      <div className='flex-1'>
        {/* Description for multi-select */}
        {currentQuestion.description && (
          <p className='text-xs md:text-sm text-gray-500 mb-3 md:mb-6'>
            {currentQuestion.description}
          </p>
        )}

        {/* Options */}
        <div className='space-y-2 md:space-y-3 mb-4 md:mb-8'>
          {currentQuestion.type === 'dropdown' ? (
            <select
              value={selectedValue}
              onChange={(e) => onOptionSelect(e.target.value)}
              className={`w-full p-2.5 md:p-4 rounded-lg border-2 transition-all text-sm md:text-base
                ${selectedValue ? `${COLORS.WARM_PURPLE.border}` : 'border-gray-200'}
                focus:outline-none 
                focus:ring-2 
                ${COLORS.WARM_PURPLE.ring}
                focus:border-${COLORS.WARM_PURPLE.DEFAULT}`}
            >
              <option value=''>Select a state...</option>
              {currentQuestion.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onOptionSelect(option.id)}
                className={`w-full p-2.5 md:p-4 rounded-lg border-2 transition-all text-left text-sm md:text-base
                  ${
                    isOptionSelected(option.id)
                      ? `${COLORS.WARM_PURPLE.border} 
                         ${COLORS.WARM_PURPLE['5']} 
                         ring-2 
                         ${COLORS.WARM_PURPLE.ring}
                         outline-none`
                      : `border-gray-200 bg-white ${COLORS.WARM_PURPLE.hoverBorder}`
                  } 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-${COLORS.WARM_PURPLE.DEFAULT} 
                  focus:border-${COLORS.WARM_PURPLE.DEFAULT}`}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Navigation - Pinned to bottom */}
      <div className='mt-2 md:mt-auto'>
        <button
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className={`w-full px-4 md:px-8 py-2.5 md:py-3 text-sm md:text-base text-white rounded-lg font-medium 
            disabled:opacity-50 disabled:cursor-not-allowed 
            ${COLORS.WARM_PURPLE.bg} 
            ${COLORS.WARM_PURPLE.hover} 
            transition-colors`}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function useOnboardingSubmission() {
  const { user: clerkUser } = useClerk();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (selectedAnswers: Record<number, string[]>, currentStep: number) => {
    setIsSubmitting(true);

    // Track onboarding submission start
    posthog.capture('onboarding_submission_start', {
      user_id: clerkUser?.id,
      total_questions: onboardingQuestions.length,
      current_step: currentStep,
    });

    try {
      // Check if user is in allowed emails list (salesperson)
      const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || '';
      const isAllowedEmail = ALLOWED_EMAILS.includes(userEmail);

      if (!isAllowedEmail) {
        // Prepare onboarding data for tracking
        const onboardingData = Object.entries(selectedAnswers).map(([questionId, answers]) => ({
          questionId: parseInt(questionId),
          answers,
        }));

        // Track onboarding data details
        posthog.capture('onboarding_data_collected', {
          user_id: clerkUser?.id,
          email_domain: userEmail.split('@')[1] || 'unknown',
          total_questions_answered: onboardingData.length,
          questions_data: onboardingData.map((q) => ({
            questionId: q.questionId,
            answersCount: q.answers.length,
          })),
        });

        // Only submit data for non-salespeople
        await submitOnboardingData(selectedAnswers);

        // Update Clerk user metadata to mark onboarding as complete
        if (clerkUser) {
          await clerkUser.update({
            unsafeMetadata: {
              ...clerkUser.unsafeMetadata,
              onboardingComplete: true,
            },
          });

          // Track successful onboarding completion
          posthog.capture('onboarding_completed', {
            user_id: clerkUser.id,
            email_domain: userEmail.split('@')[1] || 'unknown',
            total_questions_answered: onboardingData.length,
          });
        }

        // Show success toast
        toast.success('Onboarding completed successfully!', {
          description: `We've matched you with personalized financial insights.`,
        });

        // Close the onboarding modal
        onboardingSignal.value = false;
      } else {
        // Track skipped onboarding for salespeople
        posthog.capture('onboarding_skipped', {
          user_id: clerkUser?.id,
          reason: 'Salesperson email',
          email_domain: userEmail.split('@')[1] || 'unknown',
        });
      }
    } catch (error) {
      // Track onboarding submission error
      posthog.capture('onboarding_submission_error', {
        user_id: clerkUser?.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        current_step: currentStep,
      });

      // Show error toast
      toast.error('Onboarding submission failed', {
        description: 'Please try again or contact support.',
      });

      console.error('Onboarding submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}

function OnboardingModalContent({
  _clerkUser,
  currentStep,
  currentQuestion,
  isFirstQuestion,
  isLastStep,
  selectedAnswers,
  handleOptionSelect,
  handleNext,
  handleClose,
  isSubmitting,
  progress,
}: {
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
}) {
  const canProceed = selectedAnswers[currentQuestion.id]?.length > 0;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4'>
      <div className='bg-white rounded-xl md:rounded-2xl w-full max-w-5xl shadow-xl overflow-hidden h-[98vh] md:h-auto flex flex-col'>
        <div className='flex flex-col md:flex-row flex-1 overflow-hidden relative'>
          {/* Close button */}
          <button
            onClick={handleClose}
            className='absolute right-4 top-4 z-50 rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>

          <LeftSideContent
            isFirstQuestion={isFirstQuestion}
            currentQuestion={currentQuestion}
            currentStep={currentStep}
          />

          <div className='w-full md:w-7/12 flex'>
            <OnboardingContent
              currentQuestion={currentQuestion}
              selectedAnswers={selectedAnswers}
              onOptionSelect={handleOptionSelect}
              onNext={handleNext}
              isLastStep={isLastStep}
              canProceed={canProceed}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        <div className='h-0.5 md:h-1 bg-gray-100'>
          <div
            className={`h-full ${COLORS.WARM_PURPLE.bg} transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

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
