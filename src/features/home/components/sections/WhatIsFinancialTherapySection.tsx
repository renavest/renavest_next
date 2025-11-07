'use client';
import { ArrowRight, Heart, TrendingUp, Shield, Brain } from 'lucide-react';
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

  const handleBookDemoClick = () => {
    if (typeof window !== 'undefined') {
      posthog.capture('book_demo_clicked', {
        source: 'financial_therapy_section',
        url: window.location.href,
      });
      window.location.href = '/login?action=signup';
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
              Financial Therapy <span className='text-[#9071FF]'>Actually Talks About Money</span>
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
              Regular therapy avoids money talk. Financial therapy makes it the focus.
              <span className='block mt-2 font-medium text-gray-800'>
                Heal your relationship with money.
              </span>
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('overcome_anxiety')}
            >
              <div className='w-16 h-16 bg-[#9071FF] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#9071FF]/20 transition-all duration-300'>
                <Heart className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>Address Money Anxiety</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Target the emotional roots of financial stress, not just the symptoms.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('build_habits')}
            >
              <div className='w-16 h-16 bg-[#7c3aed] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#7c3aed]/20 transition-all duration-300'>
                <TrendingUp className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>
                Break Destructive Patterns
              </h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Stop the cycle of financial behaviors that damage both wallet and wellbeing.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('reduce_stress')}
            >
              <div className='w-16 h-16 bg-[#6366f1] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#6366f1]/20 transition-all duration-300'>
                <Shield className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>Reduce Workplace Impact</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Lower absenteeism and boost productivity by addressing the real problem.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('personalized_plans')}
            >
              <div className='w-16 h-16 bg-[#8b5cf6] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#8b5cf6]/20 transition-all duration-300'>
                <Brain className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>Evidence-Based Approach</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Proven therapeutic techniques specifically designed for financial wellness.
              </p>
            </div>
          </div>

          <div className='bg-gradient-to-br from-[#9071FF]/5 via-purple-50/50 to-indigo-50/30 rounded-3xl p-8 md:p-12 text-center border border-[#9071FF]/10'>
            <h3 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
              Ready to See Financial Therapy in Action?
            </h3>
            <p className='text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed'>
              Book a 30 minute consultation to connect with a financial therapists.
            </p>
            <button
              onClick={handleBookDemoClick}
              className='inline-flex items-center gap-2 px-8 py-4 bg-[#9071FF] text-white rounded-xl hover:bg-[#9071FF]/90 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-[#9071FF]/20 transform hover:-translate-y-1'
            >
              Free Consultation
              <ArrowRight className='w-5 h-5' />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default WhatIsFinancialTherapySection;
