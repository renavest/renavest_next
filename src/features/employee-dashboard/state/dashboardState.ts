import { signal } from '@preact-signals/safe-react';

import { formatDateTime } from '@/src/features/booking/utils/dateTimeUtils';
import { createDate } from '@/src/utils/timezone';

// UI State Signals
export const isHeaderScrolledSignal = signal(false);
export const selectedGoalSignal = signal<number | null>(null);
export const isScriptExpandedSignal = signal(false);
const currentInsightIndexSignal = signal(0);
export const isMobileMenuOpenSignal = signal(false);

// Sample data
const insightData = [
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
  { name: 'Monthly Dining Out', past: 45, current: 30 },
  { name: 'Automated Savings', past: 15, current: 35 },
  { name: 'Entertainment Spending', past: 25, current: 15 },
  { name: 'Utility Bills', past: 20, current: 18 },
  { name: 'Subscription Services', past: 10, current: 6 },
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
    'Money is a tool for creating the life I want, not a source of stress. This week, I will approach my finances with curiosity and compassion. Each financial decision is an opportunity to align with my values and long-term goals.',
  author: 'Paige Williams',
  weekOf: formatDateTime(createDate(), 'America/New_York').date,
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
