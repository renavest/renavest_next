'use client';
import { HeartHandshake, Brain, ClipboardList } from 'lucide-react';
import posthog from 'posthog-js';
import { useEffect, useRef, useState } from 'react';
import { Parallax } from 'react-scroll-parallax';

function WhatIsFinancialTherapySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasSectionBeenViewed, setHasSectionBeenViewed] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasSectionBeenViewed) {
          setHasSectionBeenViewed(true);

          // Track when section becomes visible
          if (typeof window !== 'undefined') {
            posthog.capture('section_viewed', {
              section_name: 'what_is_financial_therapy',
              url: window.location.href,
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
  }, [hasSectionBeenViewed]);

  const trackCardHover = (cardName: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('financial_therapy_card_hover', {
        card_name: cardName,
        section: 'what_is_financial_therapy',
        url: window.location.href,
      });
    }
  };

  return (
    <>
      <span id='what-is-financial-therapy' className='block scroll-mt-16'></span>
      <section ref={sectionRef} className='w-full py-24 bg-[#f9f8ff]'>
        <div className='max-w-6xl mx-auto px-6 md:px-10'>
          <Parallax
            translateY={[-10, 10]}
            opacity={[0.8, 1]}
            className='max-w-3xl mx-auto text-center mb-20'
          >
            <span className='px-4 py-2 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-sm mb-4 inline-block'>
              WHAT IS FINANCIAL THERAPY?
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Financial Therapy: Beyond Traditional Financial Wellness
            </h2>
            <p className='text-xl text-gray-600 leading-relaxed'>
              Unlike standard financial education or advice, financial therapy addresses the
              emotional and psychological factors that drive financial behavior. Our financial
              therapists help your employees:
            </p>
          </Parallax>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-10 mb-12'>
            <Parallax
              translateY={[30, -20]}
              scale={[0.9, 1]}
              className='flex flex-col h-full bg-white rounded-3xl p-12 shadow-lg hover:shadow-2xl transition-shadow duration-500 group items-center'
              onMouseEnter={() => trackCardHover('overcome_financial_anxiety')}
            >
              <div className='bg-[#9071FF]/10 rounded-full w-20 h-20 flex items-center justify-center mb-8 group-hover:bg-[#9071FF]/20 transition-colors duration-500'>
                <HeartHandshake className='text-[#9071FF]' size={40} />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-4 text-center'>
                Overcome Financial Anxiety & Stress
              </h3>
              <p className='text-gray-600 text-lg text-center'>
                Identify and address the root causes of financial anxiety and stress with expert
                support.
              </p>
            </Parallax>
            <Parallax
              translateY={[20, -30]}
              scale={[0.9, 1]}
              className='flex flex-col h-full bg-white rounded-3xl p-12 shadow-lg hover:shadow-2xl transition-shadow duration-500 group items-center'
              onMouseEnter={() => trackCardHover('build_healthier_money_habits')}
            >
              <div className='bg-[#9071FF]/10 rounded-full w-20 h-20 flex items-center justify-center mb-8 group-hover:bg-[#9071FF]/20 transition-colors duration-500'>
                <Brain className='text-[#9071FF]' size={40} />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-4 text-center'>
                Build Healthier Money Habits
              </h3>
              <p className='text-gray-600 text-lg text-center'>
                Develop sustainable, positive money habits through behavioral change techniques.
              </p>
            </Parallax>
            <Parallax
              translateY={[40, -40]}
              scale={[0.9, 1]}
              className='flex flex-col h-full bg-white rounded-3xl p-12 shadow-lg hover:shadow-2xl transition-shadow duration-500 group items-center'
              onMouseEnter={() => trackCardHover('personalized_wellness_plans')}
            >
              <div className='bg-[#9071FF]/10 rounded-full w-20 h-20 flex items-center justify-center mb-8 group-hover:bg-[#9071FF]/20 transition-colors duration-500'>
                <ClipboardList className='text-[#9071FF]' size={40} />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-4 text-center'>
                Personalized Wellness Plans
              </h3>
              <p className='text-gray-600 text-lg text-center'>
                Work with a therapist to create a financial wellness plan tailored to your unique
                needs.
              </p>
            </Parallax>
          </div>
          <Parallax
            translateY={[10, -10]}
            opacity={[0.7, 1]}
            className='text-center text-gray-600 text-lg max-w-2xl mx-auto'
          >
            All delivered through secure, confidential 1-on-1 sessions with licensed professionals.
          </Parallax>
        </div>
      </section>
    </>
  );
}

export default WhatIsFinancialTherapySection;
