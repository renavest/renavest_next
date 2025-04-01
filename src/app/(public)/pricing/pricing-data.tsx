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
      'Full Access to AI SaaS platform',
      '100 Financial Therapy Meeting Credits',
      '2 webinar on financial therapy per year',
      'Basic analytics / reporting for HR',
    ],
    missingFeatures: ['1 hour response time', 'Advanced reporting tools'],
    buttonVariant: 'secondary' as const,
    popularChoice: false,
  },
  {
    name: 'Pro',
    price: 30,
    annualPrice: 360,
    savings: '20%',
    features: [
      'Full Access to AI SaaS platform',
      '200 Financial Therapy Meeting Credits',
      '4 webinar on financial therapy per year',
      'Analytics/ reporting for HR',
      'Priority email support',
    ],
    missingFeatures: ['1 hour response time'],
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
      'Full Access to AI SaaS platform',
      '400 Financial Therapy Meeting Credits',
      'A selection of 6 webinars and workshops',
      'Advanced Analytics / reporting for HR',
      '1 hour response time',
      'Dedicated account manager',
    ],
    missingFeatures: [],
    buttonVariant: 'secondary' as const,
    popularChoice: false,
  },
];
