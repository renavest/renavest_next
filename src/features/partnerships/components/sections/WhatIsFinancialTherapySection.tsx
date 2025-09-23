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
            posthog.capture('partnerships_section_viewed', {
              section_name: 'partnerships_what_is_financial_therapy',
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
      posthog.capture('partnerships_financial_therapy_card_hover', {
        card_name: cardName,
        section: 'partnerships_what_is_financial_therapy',
        url: window.location.href,
      });
    }
  };

  const handleBookDemoClick = () => {
    if (typeof window !== 'undefined') {
      posthog.capture('partnerships_book_demo_clicked', {
        source: 'partnerships_financial_therapy_section',
        url: window.location.href,
      });
      window.open('https://calendly.com/rameau-stan/one-on-one', '_blank');
    }
  };

  return (
    <>
      <span id='what-is-financial-therapy' className='block scroll-mt-16'></span>
      <section ref={sectionRef} className='py-20 bg-white'>
        <div className='max-w-6xl mx-auto px-6 md:px-10'>
          <div className='text-center mb-16'>
            <span className='px-4 py-2 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-sm mb-6 inline-block'>
              WHY PARTNER WITH US?
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              We're <span className='text-[#9071FF]'>Building the Future</span> of Financial Wellness
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
              Join us in revolutionizing how people approach their relationship with money.
              <span className='block mt-2 font-medium text-gray-800'>
                Together, we can create lasting change.
              </span>
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('market_opportunity')}
            >
              <div className='w-16 h-16 bg-[#9071FF] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#9071FF]/20 transition-all duration-300'>
                <Heart className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>Growing Market</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Financial therapy is rapidly expanding as organizations recognize the need for comprehensive financial wellness.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('proven_results')}
            >
              <div className='w-16 h-16 bg-[#7c3aed] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#7c3aed]/20 transition-all duration-300'>
                <TrendingUp className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>
                Proven Results
              </h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Our platform delivers measurable outcomes for both individuals and organizations.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('comprehensive_support')}
            >
              <div className='w-16 h-16 bg-[#6366f1] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#6366f1]/20 transition-all duration-300'>
                <Shield className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>Full Support</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Dedicated partner success team, training resources, and ongoing technical support.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('innovation_focus')}
            >
              <div className='w-16 h-16 bg-[#8b5cf6] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#8b5cf6]/20 transition-all duration-300'>
                <Brain className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>Continuous Innovation</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Regular platform updates, new features, and cutting-edge financial wellness tools.
              </p>
            </div>
          </div>

          <div className='bg-gradient-to-br from-[#9071FF]/5 via-purple-50/50 to-indigo-50/30 rounded-3xl p-8 md:p-12 text-center border border-[#9071FF]/10'>
            <h3 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
              Ready to Explore Partnership Opportunities?
            </h3>
            <p className='text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed'>
              Schedule a partnership consultation to discuss how we can work together to transform financial wellness.
            </p>
            <button
              onClick={handleBookDemoClick}
              className='inline-flex items-center gap-2 px-8 py-4 bg-[#9071FF] text-white rounded-xl hover:bg-[#9071FF]/90 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-[#9071FF]/20 transform hover:-translate-y-1'
            >
              Schedule Partnership Call
              <ArrowRight className='w-5 h-5' />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default WhatIsFinancialTherapySection;