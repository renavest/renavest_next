import Link from 'next/link';

export function CTASection() {
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
