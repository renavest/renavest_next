'use client';

import { useClerk } from '@clerk/nextjs';
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
    try {
      // Check if user is in allowed emails list (salesperson)
      const isAllowedEmail = ALLOWED_EMAILS.includes(
        clerkUser?.emailAddresses[0]?.emailAddress || '',
      );

      if (!isAllowedEmail) {
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
        }
      }

      // Update local state regardless of user type
      onboardingSignal.value = {
        isComplete: true,
        currentStep: currentStep,
        answers: selectedAnswers,
      };

      toast.success('Onboarding completed successfully!');
    } catch (error) {
      console.error('Onboarding submission failed', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}

export default function OnboardingModal() {
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
    onboardingSignal.value = {
      ...onboardingSignal.value,
      isComplete: true,
    };
  };

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
