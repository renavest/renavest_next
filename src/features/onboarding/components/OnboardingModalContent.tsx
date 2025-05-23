'use client';

import { COLORS } from '@/src/styles/colors';

import { OnboardingQuestion, onboardingQuestions } from '../state/onboardingState';

interface OnboardingModalContentProps {
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

function LeftSideContent({
  isFirstQuestion,
  currentQuestion,
  currentStep,
}: {
  isFirstQuestion: boolean;
  currentQuestion: OnboardingQuestion;
  currentStep: number;
}) {
  return (
    <div className='w-full md:w-5/12 p-6 md:p-8 flex flex-col'>
      {isFirstQuestion ? (
        <>
          <h1 className='text-2xl md:text-3xl font-semibold text-gray-900 mb-4'>
            Let's get to know you better
          </h1>
          <div className='space-y-3'>
            <p className='text-base text-gray-600'>
              Your financial journey is unique, and we're here to support you every step of the way.
            </p>
            <p className='text-base text-gray-600'>
              By understanding you better, we can match you with a financial therapist who truly
              gets you and your needs.
            </p>
          </div>
        </>
      ) : (
        <div className='space-y-3'>
          <h3 className='text-xl md:text-2xl font-semibold text-gray-900'>
            {currentQuestion.question}
          </h3>
          {currentQuestion.supportiveText && (
            <p className='text-sm text-gray-600'>{currentQuestion.supportiveText}</p>
          )}
        </div>
      )}

      {/* Simplified progress indicator */}
      <div className='mt-auto space-y-2'>
        <p className='text-xs text-gray-500'>
          {currentStep + 1} of {onboardingQuestions.length}
        </p>
        <div className='w-full bg-gray-200 rounded-full h-1'>
          <div
            className={`h-1 ${COLORS.WARM_PURPLE.bg} rounded-full transition-all duration-300`}
            style={{ width: `${((currentStep + 1) / onboardingQuestions.length) * 100}%` }}
          />
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
}: {
  currentQuestion: OnboardingQuestion;
  selectedAnswers: Record<number, string[]>;
  onOptionSelect: (optionId: string) => void;
  onNext: () => void;
  isLastStep: boolean;
  canProceed: boolean;
  isSubmitting: boolean;
}) {
  const isOptionSelected = (optionId: string) =>
    (selectedAnswers[currentQuestion.id] || []).includes(optionId);

  const selectedValue = selectedAnswers[currentQuestion.id]?.[0] || '';

  return (
    <div className='w-full bg-gray-50 p-6 md:p-8 flex flex-col min-h-full'>
      <div className='flex-1'>
        {/* Description for multi-select */}
        {currentQuestion.description && (
          <p className='text-sm text-gray-600 mb-4'>{currentQuestion.description}</p>
        )}

        {/* Options */}
        <div className='space-y-3 mb-6'>
          {currentQuestion.type === 'dropdown' ? (
            <select
              value={selectedValue}
              onChange={(e) => onOptionSelect(e.target.value)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-base
                ${selectedValue ? 'border-purple-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500`}
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
                className={`w-full p-3 rounded-lg border-2 transition-all text-left text-base
                  ${
                    isOptionSelected(option.id)
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'
                  } 
                  focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500`}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className='mt-auto'>
        <button
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className={`w-full px-6 py-3 text-base text-white rounded-lg font-medium 
            disabled:opacity-50 disabled:cursor-not-allowed 
            bg-purple-600 hover:bg-purple-700 transition-colors`}
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
  progress: _progress,
}: OnboardingModalContentProps) {
  const canProceed = selectedAnswers[currentQuestion.id]?.length > 0;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col'>
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
      </div>
    </div>
  );
}
