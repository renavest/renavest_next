import Link from 'next/link';

import DashboardHeader from '@/src/features/employee-dashboard/components/DashboardHeader';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';
function CheckIcon() {
  return (
    <svg
      className='h-5 w-5 text-green-500'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 20 20'
      fill='currentColor'
    >
      <path
        fillRule='evenodd'
        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
        clipRule='evenodd'
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className='h-5 w-5 text-gray-400'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 20 20'
      fill='currentColor'
    >
      <path
        fillRule='evenodd'
        d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
        clipRule='evenodd'
      />
    </svg>
  );
}

const plans = [
  {
    name: 'Starter plan',
    price: 10,
    annualPrice: 120,
    features: [
      'Full Access to AI SaaS platform',
      '100 Financial Therapy Meeting Credits',
      '2 webinar on financial therapy per year',
      'Basic analytics / reporting for HR',
    ],
    missingFeatures: ['1 hour response time'],
    buttonVariant: 'secondary' as const,
  },
  {
    name: 'Pro plan',
    price: 30,
    annualPrice: 360,
    features: [
      'Full Access to AI SaaS platform',
      '200 Financial Therapy Meeting Credits',
      '4 webinar on financial therapy per year',
      'Analytics/ reporting for HR',
    ],
    missingFeatures: ['1 hour response time'],
    buttonVariant: 'primary' as const,
    featured: true,
  },
  {
    name: 'Business plan',
    price: 50,
    annualPrice: 600,
    features: [
      'Full Access to AI SaaS platform',
      '400 Financial Therapy Meeting Credits',
      'A selection of 6 webinars and workshops',
      'Advanced Analytics / reporting for HR',
      '1 hour response time',
    ],
    missingFeatures: [],
    buttonVariant: 'secondary' as const,
  },
];

export default function PricingPage() {
  return (
    <div className='bg-white py-24'>
      <DashboardHeader />
      <div className='mx-auto max-w-7xl px-6 lg:px-8 pt-16'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
            Pricing that scale with business
          </h1>
          <p className='mt-6 text-lg leading-8 text-gray-600'>
            Our competitive pricing plans offer unmatched value, catering to a variety of needs.
          </p>
        </div>
        <div className='isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3'>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                plan.featured ? 'bg-gray-900 text-white ring-gray-900' : 'ring-gray-200 bg-white',
                'rounded-3xl p-8 ring-1 xl:p-10',
              )}
            >
              <h3
                className={cn(
                  plan.featured ? 'text-white' : 'text-gray-900',
                  'text-lg font-semibold leading-8',
                )}
              >
                {plan.name}
              </h3>

              <p className='mt-4 flex items-baseline gap-x-2'>
                <span
                  className={cn(
                    plan.featured ? 'text-white' : 'text-gray-900',
                    'text-4xl font-bold tracking-tight',
                  )}
                >
                  ${plan.price}.00
                </span>
                <span
                  className={cn(
                    plan.featured ? 'text-gray-300' : 'text-gray-600',
                    'text-sm leading-6',
                  )}
                >
                  /employee/mo
                </span>
              </p>
              <p
                className={cn(
                  plan.featured ? 'text-gray-300' : 'text-gray-600',
                  'mt-1 text-sm leading-6',
                )}
              >
                Billed annually: ${plan.annualPrice}/employee/year
              </p>
              <Link
                href='/employer'
                className={cn(
                  plan.featured
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : `${COLORS.WARM_PURPLE.bg} text-white hover:${COLORS.WARM_PURPLE.hover}`,
                  'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                )}
              >
                Sign Up
              </Link>
              <ul
                className={cn(
                  plan.featured ? 'text-gray-300' : 'text-gray-600',
                  'mt-8 space-y-3 text-sm leading-6',
                )}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className='flex gap-x-3'>
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
                {plan.missingFeatures.map((feature) => (
                  <li key={feature} className='flex gap-x-3'>
                    <XIcon />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className='mt-16 flex justify-center'>
          <p className='text-center text-lg text-gray-700 max-w-2xl'>
            Ready to empower your team with financial wellness?
          </p>
        </div>
        <div className='mt-6 flex justify-center'>
          <Link
            href='/'
            className='text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600'
          >
            Schedule a demo <span aria-hidden='true'>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
