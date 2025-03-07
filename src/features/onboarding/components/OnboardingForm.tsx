'use client';

interface OnboardingFormProps {
  currentQuestion: {
    id: number;
    question: string;
    description?: string;
    options: Array<{ id: string; label: string }>;
  };
  selectedAnswers: Record<number, string[]>;
  onOptionSelect: (optionId: string) => void;
  onNext: () => void;
  isLastStep: boolean;
}

export default function OnboardingForm({
  currentQuestion,
  selectedAnswers,
  onOptionSelect,
  onNext,
  isLastStep,
}: OnboardingFormProps) {
  const isOptionSelected = (optionId: string) => {
    const answers = selectedAnswers[currentQuestion.id] || [];
    return answers.includes(optionId);
  };

  const canProceed = selectedAnswers[currentQuestion.id]?.length > 0;

  return (
    <div className='w-7/12 bg-[#952e8f]/5 p-12'>
      {/* Question */}
      <div className='mb-8'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>{currentQuestion.question}</h2>
        {currentQuestion.description && (
          <p className='text-gray-500'>{currentQuestion.description}</p>
        )}
      </div>

      {/* Options */}
      <div className='space-y-3 mb-12'>
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onOptionSelect(option.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              isOptionSelected(option.id)
                ? 'border-[#952e8f] bg-white text-[#952e8f]'
                : 'border-gray-200 bg-white hover:border-[#952e8f]/30'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className='flex justify-end'>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className='px-8 py-3 bg-gray-900 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors'
        >
          {isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
