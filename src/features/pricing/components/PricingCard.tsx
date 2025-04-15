import Link from 'next/link';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { Plan } from '../data/pricing-data';

import { CheckIcon, XIcon } from './pricing-icons';

export function PricingCard({ plan }: { plan: Plan }) {
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
          Billed annually
        </p>
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
