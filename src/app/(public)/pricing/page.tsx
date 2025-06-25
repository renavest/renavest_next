'use client';

import { Navbar } from '@/src/features/home';
import PricingCalculator from '@/src/features/pricing/components/PricingCalculator';

export default function PricingPage() {
  return (
    <div className='bg-white py-24'>
      <Navbar />
      <div className='mx-auto max-w-7xl px-6 lg:px-8 pt-16'>
        <div className='text-center mb-16'>
          <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
            Renavest Pricing
          </h1>
          <p className='mt-6 text-lg leading-8 text-gray-600'>
            Discover the impact and affordability of providing financial therapy for your team
          </p>
        </div>

        <PricingCalculator />
      </div>
    </div>
  );
}
