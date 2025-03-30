'use client';

import { COLORS } from '@/src/styles/colors';

import { OnboardingQuestion, onboardingQuestions } from '../state/onboardingState';

export interface LeftSideContentProps {
  isFirstQuestion: boolean;
  currentQuestion: OnboardingQuestion;
  currentStep: number;
}

export function LeftSideContent({
  isFirstQuestion,
  currentQuestion,
  currentStep,
}: LeftSideContentProps) {
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
          {onboardingQuestions.map((_, index: number) => (
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
