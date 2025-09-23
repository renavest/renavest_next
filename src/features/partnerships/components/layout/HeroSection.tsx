import { heroSubtitleSignal, heroTitleSignal } from '@/src/features/utm/utmCustomDemo';

import CTAButton from '../interactive/CTAButton';

function HeroSection() {
  return (
    <main className='w-full flex flex-col items-center pt-32 overflow-hidden' role='main'>
      <div className='flex flex-col lg:flex-row w-full max-w-6xl px-4 md:px-10 py-8 lg:py-16 items-center'>
        <div className='lg:w-1/2 text-center lg:text-left mb-12 md:mb-0 lg:pr-16'>
          <header>
            <h1 className='text-3xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8 text-gray-900 leading-tight'>
              {heroTitleSignal.value}
            </h1>
            <div
              className='text-base md:text-lg text-gray-600 mb-8 leading-relaxed px-4 lg:px-0'
              role='doc-subtitle'
            >
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>80% of Americans feel financial anxiety</li>
                <li>Speak with a Financial Therapists Today</li>
              </ul>
            </div>
          </header>
          <div className='flex justify-center lg:justify-start px-4 lg:px-0'>
            <CTAButton
              className='px-6 py-3 xl:px-8 xl:py-4 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition font-medium text-xl lg:text-2xl'
              aria-label='Get started with Renavest financial therapy'
            />
          </div>
        </div>
        <div className='lg:w-1/2 flex justify-center items-center relative my-8 mb-16 lg:mt-0'>
          <figure className='w-full max-w-full'>
            <img
              src='/hero-image1.png'
              alt='Renavest financial therapy platform dashboard showing employee wellness metrics and therapist connections'
              className='w-full h-auto object-contain max-w-full'
              loading='lazy'
              width='1000'
              height='600'
            />
          </figure>
        </div>
      </div>
    </main>
  );
}

export default HeroSection;