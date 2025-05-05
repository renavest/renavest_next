import { ArrowRight } from 'lucide-react';

import { ctaTextSignal } from '@/src/features/home/state/ctaSignals';

function HeroSection() {
  return (
    <section className='w-full flex flex-col items-center mt-24 md:mt-28'>
      <div className='flex flex-col md:flex-row w-full max-w-6xl px-6 md:px-10 py-20 items-center'>
        <div className='md:w-1/2 mb-16 md:mb-0 md:pr-16'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-gray-900 leading-tight'>
            Money stress is costing your
            <span className='text-[#9071FF]'> company.</span>
          </h1>
          <p className='text-xl text-gray-600 mb-12 leading-relaxed'>
            40% of employees waste 3+ productive hours weekly dealing with financial anxiety.
          </p>
          <div className='flex flex-col sm:flex-row gap-4'>
            <a href='#jasmine-journey'>
              <button className='px-8 py-4 bg-[#9071FF] text-white rounded-full shadow-sm hover:shadow-md hover:bg-[#9071FF]/90 transition font-medium text-base flex items-center gap-2'>
                {ctaTextSignal.value} <ArrowRight size={18} />
              </button>
            </a>
          </div>
        </div>
        <div className='md:w-1/2 flex justify-center items-center relative'>
          {/* Replaced Clouds with Demo Image */}
          <img
            src='https://d2qcuj7ucxw61o.cloudfront.net/demo_example.png'
            alt='Demo Example'
            style={{
              width: '100%',
              minWidth: '650px',
              maxWidth: '950px',
              display: 'block',
              marginLeft: '70px',
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
