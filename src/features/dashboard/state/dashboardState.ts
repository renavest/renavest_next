import { signal } from '@preact-signals/safe-react';

export const currentInsightIndexSignal = signal(0);
export const mobileMenuOpenSignal = signal(false);

// Sample data
export const insightData = [
  {
    id: 1,
    message:
      'Based on your spending habits, you tend to overspend on weekends. Try setting a weekend budget cap.',
    category: 'Spending',
    iconType: 'dollar',
  },
  {
    id: 2,
    message:
      "You grew up in a household where money was a stressor. Let's reframe your savings mindset.",
    category: 'Mindset',
    iconType: 'trending',
  },
  {
    id: 3,
    message:
      "Your recent spending pattern shows impulse buying. Would you like to set a 'cool-off' timer before big purchases?",
    category: 'Behavior',
    iconType: 'clock',
  },
];

export const comparisonData = [
  { name: 'Impulse Buys', past: 12, current: 5 },
  { name: 'Savings Rate', past: 5, current: 15 },
  { name: 'Weekend Spending', past: 30, current: 18 },
  { name: 'Bill Payments', past: 85, current: 98 },
  { name: 'Budget Adherence', past: 60, current: 85 },
];

export const therapists = [
  {
    id: 1,
    name: 'Dr. Lisa Smith',
    specialty: 'Financial Anxiety',
    nextAvailable: 'Tuesday at 2 PM',
    matchScore: 95,
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Debt Management',
    nextAvailable: 'Wednesday at 11 AM',
    matchScore: 87,
  },
  {
    id: 3,
    name: 'Dr. Sarah Johnson',
    specialty: 'Budgeting',
    nextAvailable: 'Thursday at 3 PM',
    matchScore: 82,
  },
];

// Current week's money script from the therapist
export const weeklyMoneyScript = {
  message:
    "I notice a pattern where financial decisions are influenced by childhood experiences of scarcity. This week, let's focus on recognizing when past fears are driving present decisions, and practice our grounding techniques before making financial choices.",
  author: 'Dr. Sarah Chen',
  weekOf: 'March 18, 2024',
};

// Actionable insights with detailed impact
export const actionableInsights = [
  {
    id: 1,
    message: 'You spent $250 on dining out this week—consider setting a meal budget.',
    impact:
      'If you reduced dining out to twice a week, you could save $150 monthly towards your home down payment goal.',
    category: 'spending',
  },
  {
    id: 2,
    message: 'Your entertainment spending has increased by 40% this month.',
    impact:
      'Reducing movie outings from 4 to 2 times monthly would save you $60, putting you $180 closer to your emergency fund goal.',
    category: 'behavior',
  },
];
