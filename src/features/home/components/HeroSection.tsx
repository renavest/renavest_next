import { ArrowRight } from 'lucide-react';

import { ctaTextSignal } from '@/src/features/home/state/ctaSignals';

function HeroSection() {
  return (
    <section className='w-full flex flex-col items-center mt-8 md:mt-20'>
      <div className='flex flex-col lg:flex-row w-full max-w-6xl px-4 md:px-10 py-16 lg:py-20 items-center'>
        <div className='lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0 lg:pr-16'>
          <h1 className='text-2xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-gray-900 leading-tight'>
            Transform Your Workplace with
            <span className='text-[#9071FF] block lg:inline'> Financial Therapy.</span>
          </h1>
          <p className='text-base md:text-lg text-gray-600 mb-8 md:mb-12 leading-relaxed px-4 lg:px-0'>
            Your workforce's financial stress is costing you $2,500 per employee annually.
          </p>
          <div className='flex justify-center lg:justify-start px-4 lg:px-0'>
            <a href='#jasmine-journey' className='w-full max-w-[300px] lg:w-auto'>
              <button className='w-full px-6 md:px-8 py-3 md:py-4 bg-[#9071FF] text-white rounded-full shadow-sm hover:shadow-md hover:bg-[#9071FF]/90 transition font-medium text-base flex items-center justify-center gap-2'>
                {ctaTextSignal.value} <ArrowRight size={18} />
              </button>
            </a>
          </div>
        </div>
        <div className='lg:w-1/2 flex justify-center items-center relative mt-8 lg:mt-0'>
          <img
            src='https://d2qcuj7ucxw61o.cloudfront.net/demo_example.png'
            alt='Demo Example'
            className='w-full max-w-[650px] lg:max-w-[950px] lg:ml-[70px] object-contain'
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
