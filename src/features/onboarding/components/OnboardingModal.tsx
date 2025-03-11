'use client';

import { useEffect, useState } from 'react';

import { COLORS } from '@/src/styles/colors';

import { onboardingQuestions, onboardingSignal } from '../state/onboardingState';

interface OnboardingContentProps {
  currentQuestion: {
    id: number;
    question: string;
    description?: string;
    options: Array<{ id: string; label: string }>;
    multiSelect?: boolean;
  };
  selectedAnswers: Record<number, string[]>;
  onOptionSelect: (optionId: string) => void;
  onNext: () => void;
  isLastStep: boolean;
  canProceed: boolean;
}

function OnboardingContent({
  currentQuestion,
  selectedAnswers,
  onOptionSelect,
  onNext,
  isLastStep,
  canProceed,
}: OnboardingContentProps) {
  const isOptionSelected = (optionId: string) =>
    (selectedAnswers[currentQuestion.id] || []).includes(optionId);

  return (
    <div className={`w-full ${COLORS.WARM_PURPLE['5']} p-6 md:p-12 flex flex-col min-h-full`}>
      <div>
        {/* Question */}
        <div className='mb-6 md:mb-8'>
          <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-2'>
            {currentQuestion.question}
          </h2>
          {currentQuestion.description && (
            <p className='text-gray-500'>{currentQuestion.description}</p>
          )}
        </div>

        {/* Options */}
        <div className='space-y-3 mb-6 md:mb-8'>
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onOptionSelect(option.id)}
              className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all text-left 
                ${
                  isOptionSelected(option.id)
                    ? `${COLORS.WARM_PURPLE.border} 
                       ${COLORS.WARM_PURPLE['5']} 
                       ring-2 
                       ${COLORS.WARM_PURPLE.ring}
                       outline-none`
                    : `border-gray-200 bg-white ${COLORS.WARM_PURPLE.hoverBorder} `
                } 
                focus:outline-none 
                focus:ring-2 
                focus:ring-${COLORS.WARM_PURPLE.DEFAULT} 
                focus:border-${COLORS.WARM_PURPLE.DEFAULT}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation - Pinned to bottom */}
      <div className='mt-auto'>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`w-full px-6 md:px-8 py-3 text-white rounded-lg font-medium disabled:opacity-50 ${COLORS.WARM_PURPLE.bg} disabled:cursor-not-allowed ${COLORS.WARM_PURPLE.hover} transition-colors`}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}

const updateOnboardingSignal = (
  currentStep: number,
  selectedAnswers: Record<number, string[]>,
  isLastStep: boolean,
) => {
  onboardingSignal.value = {
    isComplete: isLastStep,
    currentStep: isLastStep ? currentStep : currentStep + 1,
    answers: { ...selectedAnswers },
  };
};

export default function OnboardingModal() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>(
    () => onboardingSignal.value.answers,
  );

  const [signalState, setSignalState] = useState(onboardingSignal.value);

  useEffect(() => {
    const unsubscribe = onboardingSignal.subscribe((newValue) => {
      setSignalState(newValue);
    });
    return () => unsubscribe();
  }, []);

  const currentStep = signalState.currentStep;
  const currentQuestion = onboardingQuestions[currentStep];
  const progress = ((currentStep + 1) / onboardingQuestions.length) * 100;
  const isLastStep = currentStep === onboardingQuestions.length - 1;

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
    updateOnboardingSignal(currentStep, selectedAnswers, isLastStep);
  };

  const canProceed = selectedAnswers[currentQuestion.id]?.length > 0;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
      <div className='bg-white rounded-2xl w-full max-w-5xl shadow-xl overflow-hidden max-h-[95vh] flex flex-col'>
        <div className='flex flex-col md:flex-row overflow-auto'>
          {/* Left side - Content */}
          <div className='w-full md:w-5/12 p-6 md:p-12 flex flex-col'>
            <h1 className='text-3xl md:text-4xl font-semibold text-gray-900 mb-4'>
              Let's get to know you better
            </h1>
            <p className='text-gray-600 mb-8'>
              We'll help match you with the right financial therapist based on your needs.
            </p>

            {/* Progress dots */}
            <div className='mt-4 md:mt-auto flex gap-2'>
              {onboardingQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep ? `${COLORS.WARM_PURPLE.bg}` : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <div className='w-full md:w-7/12 flex'>
            <OnboardingContent
              currentQuestion={currentQuestion}
              selectedAnswers={selectedAnswers}
              onOptionSelect={handleOptionSelect}
              onNext={handleNext}
              isLastStep={isLastStep}
              canProceed={canProceed}
            />
          </div>
        </div>

        {/* Bottom progress bar */}
        <div className='h-1 bg-gray-100'>
          <div
            className={`h-full bg-${COLORS.WARM_PURPLE.DEFAULT} transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
