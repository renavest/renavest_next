import Link from 'next/link';

import DashboardHeader from '@/src/features/employee-dashboard/components/DashboardHeader';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

// Icons extracted to separate file to reduce main file size
import { plans, Plan } from './pricing-data';
import { CheckIcon, XIcon } from './pricing-icons';

// Plan data moved to separate file

// Extracted PricingCard component to reduce main function line count
function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={cn(
        plan.featured
          ? 'bg-gray-900 text-white ring-gray-900 shadow-lg scale-105 z-10'
          : 'ring-gray-200 bg-white hover:shadow-md transition-all',
        'rounded-3xl p-8 ring-1 xl:p-10 relative',
      )}
    >
      {plan.popularChoice && (
        <div className='absolute -top-4 left-0 right-0 flex justify-center'>
          <span className='bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium'>
            Most Popular
          </span>
        </div>
      )}
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
          ${plan.price}
        </span>
        <span
          className={cn(plan.featured ? 'text-gray-300' : 'text-gray-600', 'text-sm leading-6')}
        >
          /employee/mo
        </span>
      </p>
      <div className='flex flex-col gap-1 mt-2'>
        <p className={cn(plan.featured ? 'text-gray-300' : 'text-gray-600', 'text-sm leading-6')}>
          Billed annually: ${plan.annualPrice}/employee/year
        </p>
        {plan.savings !== '0' && (
          <p className='text-green-500 text-sm font-medium'>
            Save {plan.savings} with annual billing
          </p>
        )}
      </div>
      <Link
        href='/employer'
        className={cn(
          plan.featured
            ? 'bg-white text-gray-900 hover:bg-gray-100'
            : `${COLORS.WARM_PURPLE.bg} text-white hover:${COLORS.WARM_PURPLE.hover}`,
          'mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
        )}
      >
        {plan.featured ? 'Get Started Now' : 'Sign Up'}
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
          <li key={feature} className='flex gap-x-3 opacity-50'>
            <XIcon />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Extracted PricingHeader component to reduce main function line count
function PricingHeader() {
  return (
    <div className='mx-auto max-w-4xl text-center'>
      <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
        Simple, Transparent Pricing
      </h1>
      <p className='mt-6 text-lg leading-8 text-gray-600'>
        Choose the perfect plan for your team's financial wellness journey.{' '}
        <span className='font-medium'>No hidden fees.</span>
      </p>
      <div className='mt-4 inline-block bg-gray-100 px-4 py-2 rounded-lg'>
        <p className='text-sm text-gray-700'>
          All plans include a <span className='font-medium'>30-day money-back guarantee</span>
        </p>
      </div>
    </div>
  );
}

// Extracted WhyChooseUs component
function WhyChooseUs() {
  return (
    <div className='bg-gray-50 p-8 rounded-xl max-w-3xl w-full'>
      <h2 className='text-2xl font-semibold text-center mb-6'>Why Companies Choose Renavest</h2>
      <div className='grid md:grid-cols-2 gap-6'>
        <BenefitItem
          icon='check'
          color='green'
          title='Increased Productivity'
          description='Employees with financial wellness are 32% more productive'
        />
        <BenefitItem
          icon='turnover'
          color='blue'
          title='Lower Turnover'
          description='Reduce employee turnover by up to 28%'
        />
        <BenefitItem
          icon='roi'
          color='purple'
          title='ROI Positive'
          description='Average 3.4x return on investment'
        />
        <BenefitItem
          icon='quick'
          color='yellow'
          title='Quick Implementation'
          description='Get started in less than 2 weeks'
        />
      </div>
    </div>
  );
}

// Extracted BenefitItem component
function BenefitItem({
  icon,
  color,
  title,
  description,
}: {
  icon: 'check' | 'turnover' | 'roi' | 'quick';
  color: 'green' | 'blue' | 'purple' | 'yellow';
  title: string;
  description: string;
}) {
  // Icon paths based on type
  const iconPaths: Record<string, string> = {
    check: 'M5 13l4 4L19 7',
    turnover:
      'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z',
    roi: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    quick: 'M13 10V3L4 14h7v7l9-11h-7z',
  };

  return (
    <div className='flex gap-3'>
      <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
        <svg
          className={`h-6 w-6 text-${color}-600`}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={iconPaths[icon]} />
        </svg>
      </div>
      <div>
        <h3 className='font-medium'>{title}</h3>
        <p className='text-sm text-gray-600'>{description}</p>
      </div>
    </div>
  );
}

// Extracted CTASection component
function CTASection() {
  return (
    <div className='mt-12 text-center'>
      <h3 className='text-xl font-medium mb-4'>Still have questions?</h3>
      <div className='flex flex-col sm:flex-row gap-4 justify-center'>
        <Link
          href='/contact'
          className='text-sm font-semibold px-6 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
        >
          Contact Sales
        </Link>
        <Link
          href='/'
          className='text-sm font-semibold px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors'
        >
          Schedule a Demo <span aria-hidden='true'>→</span>
        </Link>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className='bg-white py-24'>
      <DashboardHeader />
      <div className='mx-auto max-w-7xl px-6 lg:px-8 pt-16'>
        <PricingHeader />

        <div className='isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3'>
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className='mt-20 flex flex-col items-center'>
          <WhyChooseUs />
          <CTASection />
        </div>
      </div>
    </div>
  );
}
