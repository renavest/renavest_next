export function PricingHeader() {
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
