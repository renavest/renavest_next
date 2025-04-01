// Type for plan features
type PlanFeature = string;

// Plan type definition
export type Plan = {
  name: string;
  price: number;
  annualPrice: number;
  savings: string;
  features: PlanFeature[];
  missingFeatures: PlanFeature[];
  buttonVariant: 'primary' | 'secondary';
  popularChoice: boolean;
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    name: 'Starter',
    price: 10,
    annualPrice: 120,
    savings: '0',
    features: [
      'Comprehensive financial wellness platform for your team',
      'Up to 100 personalized therapy sessions for employees',
      'Bi-annual expert-led financial wellness workshops',
      'Track employee engagement and program impact',
    ],
    missingFeatures: ['Expedited support response times', 'In-depth ROI and impact reporting'],
    buttonVariant: 'secondary' as const,
    popularChoice: false,
  },
  {
    name: 'Pro',
    price: 30,
    annualPrice: 360,
    savings: '20%',
    features: [
      'Enhanced financial wellness platform with advanced tools',
      'Up to 200 personalized therapy sessions for deeper employee support',
      'Quarterly expert-led workshops to boost financial literacy',
      'Detailed insights on program effectiveness and engagement',
      'Fast-track support to resolve issues quickly',
    ],
    missingFeatures: ['Comprehensive ROI and impact analysis'],
    buttonVariant: 'primary' as const,
    featured: true,
    popularChoice: true,
  },
  {
    name: 'Business',
    price: 50,
    annualPrice: 600,
    savings: '30%',
    features: [
      'Premium financial wellness ecosystem with all advanced features',
      'Up to 400 therapy sessions for maximum team coverage',
      'Bi-monthly workshops and tailored financial education programs',
      'Comprehensive ROI analysis and strategic program insights',
      'Immediate support access via phone and email',
      'Strategic advisor to maximize your wellness program impact',
    ],
    missingFeatures: [],
    buttonVariant: 'secondary' as const,
    popularChoice: false,
  },
];
