import { signal } from '@preact-signals/safe-react';

// UI State Signals
export const isHeaderScrolledSignal = signal(false);
export const selectedGoalSignal = signal<number | null>(null);
export const isScriptExpandedSignal = signal(false);
export const currentInsightIndexSignal = signal(0);
export const isMobileMenuOpenSignal = signal(false);

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
  { name: 'Monthly Dining Out', past: 850, current: 650 },
  { name: 'Automated Savings', past: 200, current: 500 },
  { name: 'Entertainment Spending', past: 300, current: 180 },
  { name: 'Utility Bills', past: 250, current: 220 },
  { name: 'Subscription Services', past: 120, current: 75 },
];

export const therapists = [
  {
    id: 1,
    name: 'Dr. Lisa Smith',
    specialty: 'Financial Anxiety',
    nextAvailable: 'Tuesday at 2 PM',
    matchScore: 95,
    imageUrl: 'https://randomuser.me/api/portraits/women/81.jpg',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Debt Management',
    nextAvailable: 'Wednesday at 11 AM',
    matchScore: 87,
    imageUrl: 'https://randomuser.me/api/portraits/men/82.jpg',
  },
  {
    id: 3,
    name: 'Dr. Sarah Chen',
    specialty: 'Budgeting',
    nextAvailable: 'Thursday at 3 PM',
    matchScore: 82,
    imageUrl: 'https://randomuser.me/api/portraits/women/83.jpg',
  },
];

// Current week's money belief from the therapist
export const weeklyMoneyBelief = {
  message:
    "I recognize that my financial decisions are influenced by my childhood experiences of scarcity. This week, I will pause and reflect when I feel those past fears driving my decisions. Before making financial choices, I'll practice my grounding techniques to ensure I'm acting from my present reality, not my past.",
  author: 'Dr. Sarah Chen',
  weekOf: 'March 18, 2024',
};

// Actionable insights with detailed impact
export const actionableInsights = [
  {
    id: 1,
    spending: 250,
    savings: 150,
    message: {
      prefix: 'We noticed you spent ',
      amount: '$250',
      suffix: ' on dining out this week. It seems like a busy week!',
    },
    impact: {
      prefix: "If you'd like, trying home cooking for just 3 meals could save ",
      amount: '$150',
      suffix: ' while learning some new recipes. No pressure - just a friendly suggestion!',
    },
  },
  {
    id: 2,
    spending: 180,
    savings: 165,
    message: {
      prefix: 'Your entertainment spending included ',
      amount: '$180',
      suffix: " at movie theaters this month. We love that you're making time for entertainment!",
    },
    impact: {
      prefix: 'A streaming subscription could help you save ',
      amount: '$165',
      suffix: ' while still enjoying great content. Maybe invite friends over for movie nights?',
    },
  },
];

export const financialGoals = [
  {
    id: 1,
    title: 'Emergency Fund',
    target: 10000,
    current: 6500,
    category: 'savings',
    timeframe: 'Ongoing',
    description: 'Build 3 months of living expenses',
  },
  {
    id: 2,
    title: 'Reduce Dining Out',
    target: 300,
    current: 250,
    category: 'spending',
    timeframe: 'Monthly',
    description: 'Keep monthly dining expenses under $300',
  },
  {
    id: 3,
    title: 'Vacation Fund',
    target: 2000,
    current: 800,
    category: 'savings',
    timeframe: 'By September',
    description: 'Save for summer beach trip',
  },
];
