import { signal } from '@preact-signals/safe-react';

export const onboardingSignal = signal({
  isComplete: false,
  currentStep: 0,
  answers: {} as Record<number, string[]>,
});

export const onboardingQuestions = [
  {
    id: 1,
    question: 'What is your age range?',
    options: [
      { id: '18-24', label: '18-24 years' },
      { id: '25-34', label: '25-34 years' },
      { id: '35-44', label: '35-44 years' },
      { id: '45-54', label: '45-54 years' },
      { id: '55+', label: '55+ years' },
    ],
  },
  {
    id: 2,
    question: 'Which state do you live in?',
    options: [
      { id: 'CA', label: 'California' },
      { id: 'NY', label: 'New York' },
      { id: 'TX', label: 'Texas' },
      { id: 'FL', label: 'Florida' },
      { id: 'other', label: 'Other State' },
    ],
  },
  {
    id: 3,
    question: 'What are your primary financial goals?',
    description: 'Select all that apply',
    options: [
      { id: 'emergency', label: 'Build emergency fund' },
      { id: 'debt', label: 'Pay off debt' },
      { id: 'invest', label: 'Start investing' },
      { id: 'retirement', label: 'Plan for retirement' },
      { id: 'house', label: 'Save for a house' },
    ],
    multiSelect: true,
  },
  {
    id: 4,
    question: 'What is your current financial stress level?',
    description: 'This helps us match you with the right financial therapist',
    options: [
      { id: 'low', label: 'Low - Generally comfortable' },
      { id: 'medium', label: 'Medium - Occasional worry' },
      { id: 'high', label: 'High - Frequent concern' },
    ],
  },
];
