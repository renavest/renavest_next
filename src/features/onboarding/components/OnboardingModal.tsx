'use client';

import { useEffect, useState } from 'react';

import { onboardingQuestions, onboardingSignal } from '../state/onboardingState';

import OnboardingForm from './OnboardingForm';

export default function OnboardingModal() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>(() => {
    return onboardingSignal.value.answers;
  });

  // Force re-render when signal changes
  const [signalState, setSignalState] = useState(onboardingSignal.value);

  useEffect(() => {
    // Subscribe to signal changes
    const unsubscribe = onboardingSignal.subscribe((newValue) => {
      setSignalState(newValue);
    });
    return () => unsubscribe();
  }, []);

  const currentStep = signalState.currentStep;
  const currentQuestion = onboardingQuestions[currentStep];
  const progress = ((currentStep + 1) / onboardingQuestions.length) * 100;

  console.log('Current step:', currentStep);
  console.log('Selected answers:', selectedAnswers);
  console.log('Signal state:', signalState);

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

    console.log('Moving to step:', nextStep);
    console.log('Is last step:', isLastStep);

    if (isLastStep) {
      // If this is the last step, mark as complete
      onboardingSignal.value = {
        isComplete: true,
        currentStep: currentStep,
        answers: { ...selectedAnswers },
      };
      console.log('Completing onboarding:', onboardingSignal.value);
    } else {
      // Otherwise, move to next step
      onboardingSignal.value = {
        isComplete: false,
        currentStep: nextStep,
        answers: { ...selectedAnswers },
      };
      console.log('Moving to next step:', onboardingSignal.value);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-white rounded-2xl w-full max-w-5xl mx-4 shadow-xl overflow-hidden'>
        <div className='flex'>
          {/* Left side - Content */}
          <div className='w-5/12 p-12 flex flex-col'>
            <h1 className='text-4xl font-semibold text-gray-900 mb-4'>
              Let's get to know you better
            </h1>
            <p className='text-gray-600 mb-8'>
              We'll help match you with the right financial therapist based on your needs.
            </p>

            {/* Progress dots */}
            <div className='mt-auto flex gap-2'>
              {onboardingQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-[#952e8f]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <OnboardingForm
            currentQuestion={currentQuestion}
            selectedAnswers={selectedAnswers}
            onOptionSelect={handleOptionSelect}
            onNext={handleNext}
            isLastStep={currentStep === onboardingQuestions.length - 1}
          />
        </div>

        {/* Bottom progress bar */}
        <div className='h-1 bg-gray-100'>
          <div
            className='h-full bg-[#952e8f] transition-all duration-300 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
