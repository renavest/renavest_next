import { signal } from '@preact-signals/safe-react';

export interface OnboardingQuestion {
  id: number;
  title?: string;
  question: string;
  description?: string;
  supportiveText?: string;
  options: Array<{ id: string; label: string }>;
  multiSelect?: boolean;
  type?: 'dropdown';
}

export const onboardingSignal = signal({
  isComplete: false,
  currentStep: 0,
  answers: {} as Record<number, string[]>,
});

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 1,
    title: 'Life Stage',
    question: 'What is your age range?',
    supportiveText:
      "Understanding your life stage helps us provide advice that's relevant to your journey.",
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
    title: 'Location',
    question: 'What state do you currently reside in?',
    supportiveText:
      'We’re interested in how your state impacts your spending habits.',
    type: 'dropdown',
    options: [
      { id: 'AL', label: 'Alabama' },
      { id: 'AK', label: 'Alaska' },
      { id: 'AZ', label: 'Arizona' },
      { id: 'AR', label: 'Arkansas' },
      { id: 'CA', label: 'California' },
      { id: 'CO', label: 'Colorado' },
      { id: 'CT', label: 'Connecticut' },
      { id: 'DE', label: 'Delaware' },
      { id: 'FL', label: 'Florida' },
      { id: 'GA', label: 'Georgia' },
      { id: 'HI', label: 'Hawaii' },
      { id: 'ID', label: 'Idaho' },
      { id: 'IL', label: 'Illinois' },
      { id: 'IN', label: 'Indiana' },
      { id: 'IA', label: 'Iowa' },
      { id: 'KS', label: 'Kansas' },
      { id: 'KY', label: 'Kentucky' },
      { id: 'LA', label: 'Louisiana' },
      { id: 'ME', label: 'Maine' },
      { id: 'MD', label: 'Maryland' },
      { id: 'MA', label: 'Massachusetts' },
      { id: 'MI', label: 'Michigan' },
      { id: 'MN', label: 'Minnesota' },
      { id: 'MS', label: 'Mississippi' },
      { id: 'MO', label: 'Missouri' },
      { id: 'MT', label: 'Montana' },
      { id: 'NE', label: 'Nebraska' },
      { id: 'NV', label: 'Nevada' },
      { id: 'NH', label: 'New Hampshire' },
      { id: 'NJ', label: 'New Jersey' },
      { id: 'NM', label: 'New Mexico' },
      { id: 'NY', label: 'New York' },
      { id: 'NC', label: 'North Carolina' },
      { id: 'ND', label: 'North Dakota' },
      { id: 'OH', label: 'Ohio' },
      { id: 'OK', label: 'Oklahoma' },
      { id: 'OR', label: 'Oregon' },
      { id: 'PA', label: 'Pennsylvania' },
      { id: 'RI', label: 'Rhode Island' },
      { id: 'SC', label: 'South Carolina' },
      { id: 'SD', label: 'South Dakota' },
      { id: 'TN', label: 'Tennessee' },
      { id: 'TX', label: 'Texas' },
      { id: 'UT', label: 'Utah' },
      { id: 'VT', label: 'Vermont' },
      { id: 'VA', label: 'Virginia' },
      { id: 'WA', label: 'Washington' },
      { id: 'WV', label: 'West Virginia' },
      { id: 'WI', label: 'Wisconsin' },
      { id: 'WY', label: 'Wyoming' },
    ],
  },
  {
    id: 3,
    title: 'Relationships',
    question: 'What is your current relationship status?',
    supportiveText:
      'Managing money within a relationship can be deeply impactful. Understanding your relationship status helps us navigate your financial journey more effectively.',
    options: [
      { id: 'single', label: 'Single' },
      { id: 'in_a_relationship', label: 'In a relationship' },
      { id: 'married', label: 'Married' },
      { id: 'divorced', label: 'Divorced' },
      { id: 'widowed', label: 'Widowed' },
    ],
  },
  {
    id: 4,
    title: 'Your Goals',
    question: 'What are your primary financial goals?',
    description: 'Select all that apply',
    supportiveText:
      "Your goals matter. We'll help you develop a healthy relationship with money while working towards them.",
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
    id: 5,
    title: 'Your Challenges',
    question: 'What financial challenges would you like to address?',
    description: 'Select all that apply',
    supportiveText:
      'Many people face similar challenges. Sharing yours helps us provide the right support.',
    options: [
      { id: 'conflict', label: 'Conflict in relationships' },
      { id: 'avoidance', label: 'Money avoidance' },
      { id: 'anxiety', label: 'Financial anxiety' },
      { id: 'spending', label: 'Compulsive spending' },
      { id: 'frugality', label: 'Difficulty in enjoying financial resources' },
      { id: 'guilt', label: 'Guilt related to financial decisions' },
      { id: 'inheritance', label: 'Inheritance issues' },
    ],
    multiSelect: true,
  },
  {
    id: 6,
    title: 'Stress Level',
    question: 'What is your current financial stress level?',
    // description: 'This helps us understand your financial situation better',
    supportiveText:
      'Please rate your stress level to help us provide the most appropriate support.',
    options: [
      { id: 'low', label: 'Low - Generally comfortable' },
      { id: 'medium', label: 'Medium - Occasional worry' },
      { id: 'high', label: 'High - Frequent concern' },
    ],
  },
];
