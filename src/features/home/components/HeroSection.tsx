import { Parallax } from 'react-scroll-parallax';

import { useParallaxImage } from '@/src/features/parallax/hooks/useParallaxImage';
import { heroSubtitleSignal, heroTitleSignal } from '@/src/features/utm/utmCustomDemo';

import CTAButton from './CTAButton';
function HeroSection() {
  const parallaxImage = useParallaxImage();

  return (
    <section className='w-full flex flex-col items-center pt-32'>
      <div className='flex flex-col lg:flex-row w-full max-w-6xl px-4 md:px-10 py-8 lg:py-16 items-center'>
        <Parallax
          translateY={[0, -20]}
          opacity={[0.8, 1]}
          className='lg:w-1/2 text-center lg:text-left mb-12 md:mb-0 lg:pr-16'
        >
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-gray-900 leading-tight'>
            {heroTitleSignal.value}
            <span className='text-[#9071FF] block lg:inline'></span>
          </h1>
          <p className='text-base md:text-lg text-gray-600 mb-8 leading-relaxed px-4 lg:px-0'>
            {heroSubtitleSignal.value}
          </p>
          <div className='flex justify-center lg:justify-start px-4 lg:px-0'>
            <CTAButton className='px-6 py-3 xl:px-8 xl:py-4 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition font-medium text-xl lg:text-2xl' />
          </div>
        </Parallax>
        <Parallax
          translateY={[20, -10]}
          opacity={[0.8, 1]}
          scale={[0.9, 1]}
          className='lg:w-1/2 flex justify-center items-center relative my-8 mb-16 lg:mt-0'
        >
          <img
            src='https://d2qcuj7ucxw61o.cloudfront.net/demo_example.png'
            alt='Demo Example'
            className='w-full max-w-[1000px] lg:max-w-[1600px] lg:ml-[40px] object-contain scale-110 md:scale-[1.3]'
            {...parallaxImage}
          />
        </Parallax>
      </div>
    </section>
  );
}

export default HeroSection;
