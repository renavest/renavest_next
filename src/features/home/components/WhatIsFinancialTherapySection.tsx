'use client';
import { ArrowRight, Heart, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { useEffect, useRef, useState } from 'react';

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
      <section ref={sectionRef} className='py-20 bg-white'>
        <div className='max-w-6xl mx-auto px-6 md:px-10'>
          <div className='text-center mb-16'>
            <span className='px-4 py-2 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-sm mb-6 inline-block'>
              WHAT IS FINANCIAL THERAPY?
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Financial Therapy:{' '}
              <span className='text-[#9071FF]'>Beyond Traditional Financial Wellness</span>
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
              Unlike standard financial education or advice, financial therapy addresses the
              emotional and psychological factors that drive financial behavior. Our financial
              therapists help your employees:
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('overcome_anxiety')}
            >
              <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow duration-300'>
                <Heart className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>
                Overcome Financial Anxiety & Stress
              </h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Identify and address the root causes of financial anxiety and stress with expert
                support.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('build_habits')}
            >
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow duration-300'>
                <TrendingUp className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>
                Build Healthier Money Habits
              </h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Develop sustainable, positive money habits through behavioral change techniques.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('reduce_stress')}
            >
              <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow duration-300'>
                <Shield className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>Reduce Financial Stress</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Lower cortisol levels and improve overall wellbeing through financial peace of mind.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('personalized_plans')}
            >
              <div className='w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow duration-300'>
                <ArrowRight className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>
                Personalized Wellness Plans
              </h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Work with a therapist to create a financial wellness plan tailored to your unique
                needs.
              </p>
            </div>
          </div>

          <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12 text-center border border-purple-100'>
            <h3 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
              Ready to Transform Your Team's Financial Wellness?
            </h3>
            <p className='text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed'>
              All delivered through secure, confidential 1-on-1 sessions with licensed
              professionals. Join forward-thinking companies who are investing in their employees'
              complete financial health.
            </p>
            <Link
              href='/contact'
              className='inline-flex items-center gap-2 px-8 py-4 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1'
            >
              Start Your Journey
              <ArrowRight className='w-5 h-5' />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default WhatIsFinancialTherapySection;
