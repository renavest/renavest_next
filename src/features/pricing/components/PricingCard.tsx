import Link from 'next/link';
import { useState } from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { Plan } from '../data/pricing-data';

import { CheckIcon, XIcon } from './pricing-icons';

export function PricingCard({ plan }: { plan: Plan }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const calculatePrice = () => {
    if (billingCycle === 'yearly') {
      return {
        price: plan.annualPrice / 12, // Convert annual price to monthly equivalent
        billingText: '/employee/yr',
        savings: plan.savings,
      };
    }
    return {
      price: plan.price,
      billingText: '/employee/mo',
      savings: '0',
    };
  };

  const { price, billingText, savings } = calculatePrice();

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

      {/* Billing Cycle Toggle */}
      <div className='flex justify-center items-center mt-4 space-x-2'>
        <span
          className={cn(
            billingCycle === 'monthly' ? 'font-bold' : 'text-gray-500',
            'cursor-pointer',
          )}
          onClick={() => setBillingCycle('monthly')}
        >
          Monthly
        </span>
        <div
          className='w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer'
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
        >
          <div
            className={cn(
              'w-6 h-6 bg-gray-500 rounded-full absolute top-0 transition-all duration-300',
              billingCycle === 'yearly' ? 'right-0' : 'right-6',
            )}
          />
        </div>
        <span
          className={cn(
            billingCycle === 'yearly' ? 'font-bold' : 'text-gray-500',
            'cursor-pointer',
          )}
          onClick={() => setBillingCycle('yearly')}
        >
          Yearly
        </span>
      </div>

      <p className='mt-4 flex items-baseline gap-x-2'>
        <span
          className={cn(
            plan.featured ? 'text-white' : 'text-gray-900',
            'text-4xl font-bold tracking-tight',
          )}
        >
          ${price}
        </span>
        <span
          className={cn(plan.featured ? 'text-gray-300' : 'text-gray-600', 'text-sm leading-6')}
        >
          {billingText}
        </span>
      </p>
      <div className='flex flex-col gap-1 mt-2'>
        {billingCycle === 'yearly' && savings !== '0' && (
          <p
            className={cn(
              plan.featured ? 'text-gray-300' : 'text-gray-600',
              'text-sm leading-6 text-green-600',
            )}
          >
            Save {savings} with annual billing
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
        {plan.features.map((feature: string) => (
          <li key={feature} className='flex gap-x-3'>
            <CheckIcon />
            {feature}
          </li>
        ))}
        {plan.missingFeatures.map((feature: string) => (
          <li key={feature} className='flex gap-x-3 opacity-50'>
            <XIcon />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
