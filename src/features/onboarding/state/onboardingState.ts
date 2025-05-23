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

// Helper function to get initial onboarding state
function getInitialOnboardingState() {
  if (typeof window !== 'undefined') {
    const storedState = localStorage.getItem('onboardingState');
    if (storedState) {
      return JSON.parse(storedState);
    }
  }
  return {
    isComplete: false,
    currentStep: 0,
    answers: {} as Record<number, string[]>,
  };
}

export const onboardingSignal = signal(getInitialOnboardingState());

// Update localStorage whenever the signal changes
onboardingSignal.subscribe((newValue) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('onboardingState', JSON.stringify(newValue));
  }
});

// Method to clear onboarding state (useful for logout)
export function clearOnboardingState() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('onboardingState');
    onboardingSignal.value = {
      isComplete: false,
      currentStep: 0,
      answers: {},
    };
  }
}

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 1,
    title: 'Life Stage',
    question: 'What is your age range?',
    supportiveText:
      'Understanding where you are in life helps us connect you with a therapist who truly understands your unique financial journey and challenges.',
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
      'Your location helps us understand the financial landscape you navigate daily and connect you with therapists familiar with your area.',
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
      'Money and relationships are deeply connected. Understanding your relationship context helps us match you with a therapist who can address the unique dynamics you face.',
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
    title: 'Your Aspirations',
    question: 'What financial goals are most important to you right now?',
    description: 'Select all that resonate with you',
    supportiveText:
      "Your goals reflect your values and dreams. We'll help you explore not just how to achieve them, but also understand the emotions and beliefs that drive them.",
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
    question: 'What aspects of your relationship with money would you like to explore?',
    description: 'Select all that feel relevant to your experience',
    supportiveText:
      'These challenges are more common than you might think. Sharing what resonates with you helps us connect you with a therapist who specializes in these areas.',
    options: [
      { id: 'conflict', label: 'Money-related relationship conflicts' },
      { id: 'avoidance', label: 'Avoiding financial decisions or conversations' },
      { id: 'anxiety', label: 'Feeling anxious or stressed about money' },
      { id: 'spending', label: 'Difficulty controlling spending habits' },
      { id: 'frugality', label: 'Trouble enjoying money or feeling guilty about spending' },
      { id: 'guilt', label: 'Shame or guilt around financial decisions' },
      { id: 'inheritance', label: 'Navigating family money dynamics or inheritance' },
    ],
    multiSelect: true,
  },
  {
    id: 6,
    title: 'Current Well-being',
    question: 'How would you describe your current financial stress level?',
    supportiveText:
      "There's no judgment here - we simply want to understand where you're starting from so we can provide the most supportive therapeutic experience.",
    options: [
      { id: 'low', label: 'Low - Generally comfortable and at peace with my finances' },
      { id: 'medium', label: 'Medium - Some worry, but manageable most days' },
      { id: 'high', label: 'High - Frequent stress that affects my daily life' },
    ],
  },
];
