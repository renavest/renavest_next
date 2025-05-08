'use client';
import { ArrowRight } from 'lucide-react';
import posthog from 'posthog-js';
import { useEffect, useState, useRef } from 'react';
import { Parallax } from 'react-scroll-parallax';

import { ctaTextSignal } from '@/src/features/home/state/ctaSignals';
import { useParallaxImage } from '@/src/features/parallax/hooks/useParallaxImage';

import CTAButton from './CTAButton';

function TestimonialCard({
  isVisible,
  sectionRef,
}: {
  isVisible: boolean;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const parallaxImage = useParallaxImage();

  return (
    <Parallax translateY={[30, -30]} opacity={[0.7, 1]} scale={[0.95, 1.05]}>
      <div
        ref={sectionRef}
        className={`bg-white rounded-3xl p-10 shadow-lg relative transform transition-all duration-1000 mx-auto max-w-2xl
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className='absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 transform rotate-45 bg-white'></div>
        <div className='flex justify-center mb-6'>
          <div className='w-16 h-16 rounded-full border-4 border-white overflow-hidden'>
            <img
              src='https://d2qcuj7ucxw61o.cloudfront.net/esmaa.png'
              alt='Essma Litmim'
              className='w-full h-full object-cover'
              {...parallaxImage}
            />
          </div>
        </div>
        <p className='text-xl text-gray-800 mb-8 italic text-center'>
          "My session with financial therapy coach Paige was nothing short of transformative. Her
          insight, compassion, and affirming guidance created a space where I felt truly seen and
          empowered... I walked away with a renewed sense of confidence and motivation to pursue my
          goals with intention and clarity. I'm so grateful to Renavest for creating this healing
          space... This work is transformational and will absolutely change lives."
        </p>
        <div className='text-center'>
          <span className='block font-semibold text-gray-900 text-lg'>Essma Litim</span>
          <span className='text-gray-600'>Renavest User</span>
        </div>
      </div>
    </Parallax>
  );
}

function TestimonialSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);

          // Track when section becomes visible
          if (typeof window !== 'undefined') {
            posthog.capture('section_viewed', {
              section_name: 'testimonial',
              url: window.location.href,
              visibility_time: new Date().toISOString(),
            });
          }
        }
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const trackCtaClick = (ctaType: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('testimonial_cta_clicked', {
        cta_type: ctaType,
        cta_text: ctaType === 'primary' ? ctaTextSignal.value : 'Talk to Sales',
        section: 'testimonial',
        position: 'bottom',
        url: window.location.href,
      });
    }
  };

  return (
    <>
      <span id='testimonials' className='block scroll-mt-16'></span>
      <section className='w-full py-24 bg-[#F9F9F7]'>
        <div className='max-w-6xl mx-auto px-6 md:px-10'>
          <Parallax
            translateY={[-15, 15]}
            opacity={[0.8, 1]}
            className='max-w-3xl mx-auto text-center mb-20'
          >
            <span className='px-4 py-2 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-sm mb-4 inline-block'>
              TESTIMONIALS
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              What Our Users Are Saying
            </h2>
            <p className='text-xl text-gray-600 leading-relaxed'>
              Real stories from individuals who've experienced the transformative power of financial
              therapy through Renavest.
            </p>
          </Parallax>

          <div className='mb-16'>
            <TestimonialCard isVisible={isVisible} sectionRef={sectionRef} />
          </div>

          <Parallax translateY={[15, -15]} opacity={[0.7, 1]}>
            <div
              className={`max-w-lg mx-auto text-center transform transition-all duration-1000 
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '0.2s' }}
            >
              <CTAButton />
            </div>
          </Parallax>
        </div>
      </section>
    </>
  );
}

export default TestimonialSection;
