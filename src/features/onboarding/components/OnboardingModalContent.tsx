'use client';

import { COLORS } from '@/src/styles/colors';

import { OnboardingQuestion } from '../state/onboardingState';

import { LeftSideContent, LeftSideContentProps } from './LeftSideContent';

export interface OnboardingContentProps {
  currentQuestion: OnboardingQuestion;
  selectedAnswers: Record<number, string[]>;
  onOptionSelect: (optionId: string) => void;
  onNext: () => void;
  isLastStep: boolean;
  canProceed: boolean;
  isSubmitting: boolean;
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

export function OnboardingModalContent({
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
