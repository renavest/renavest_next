import posthog from 'posthog-js';
import { Parallax } from 'react-scroll-parallax';

import { ctaTextSignal } from '@/src/features/home/state/ctaSignals';
import { useParallaxImage } from '@/src/features/parallax/hooks/useParallaxImage';

import CTAButton from './CTAButton';
function HeroSection() {
  const parallaxImage = useParallaxImage();

  const handleCtaClick = () => {
    if (typeof window !== 'undefined') {
      posthog.capture('hero_section_cta_clicked', {
        cta_text: ctaTextSignal.value,
        section: 'hero',
        position: 'top',
        url: window.location.href,
      });
    }
  };

  return (
    <section className='w-full flex flex-col items-center pt-32'>
      <div className='flex flex-col lg:flex-row w-full max-w-6xl px-4 md:px-10 py-8 lg:py-16 items-center'>
        <Parallax
          translateY={[0, -20]}
          opacity={[0.8, 1]}
          className='lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0 lg:pr-16'
        >
          <h1 className='text-2xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-gray-900 leading-tight'>
            Transform Your Workplace with
            <span className='text-[#9071FF] block lg:inline'> Financial Therapy.</span>
          </h1>
          <p className='text-base md:text-lg text-gray-600 mb-8 md:mb-12 leading-relaxed px-4 lg:px-0'>
            Your workforce's financial stress is costing you $2,500 per employee annually.
          </p>
          <div className='flex justify-center lg:justify-start px-4 lg:px-0'>
            <button
              // href='#jasmine-journey'
              className='w-full max-w-[300px] lg:w-auto'
              onClick={handleCtaClick}
            >
              <CTAButton />
            </button>
          </div>
        </Parallax>
        <Parallax
          translateY={[20, -10]}
          opacity={[0.8, 1]}
          scale={[0.9, 1]}
          className='lg:w-1/2 flex justify-center items-center relative mt-8 lg:mt-0'
        >
          <img
            src='https://d2qcuj7ucxw61o.cloudfront.net/demo_example.png'
            alt='Demo Example'
            className='w-full max-w-[650px] lg:max-w-[950px] lg:ml-[70px] object-contain'
            {...parallaxImage}
          />
        </Parallax>
      </div>
    </section>
  );
}

export default HeroSection;
