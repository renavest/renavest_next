'use client';

import { Brain, Users, Salad } from 'lucide-react';
import posthog from 'posthog-js';
import { useEffect, useState, useRef } from 'react';

function BusinessImpactSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);

          // Track when section becomes visible
          if (typeof window !== 'undefined') {
            posthog.capture('section:viewed_v1', {
              section_name: 'business_impact',
              url: window.location.href,
              visibility_timestamp: new Date().toISOString(),
              // Add user context if available
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

  const trackStatHover = (
    stat_name: string,
    stat_value: string,
    userContext: { user_id?: string; company_id?: string } = {},
  ) => {
    if (typeof window !== 'undefined') {
      posthog.capture('business_impact:stat_hover_v1', {
        stat_name,
        stat_value,
        section: 'business_impact',
        url: window.location.href,
        ...userContext,
      });
    }
  };

  return (
    <>
      <span id='business-impact' className='block scroll-mt-16'></span>
      <section className='w-full py-24 bg-white'>
        <div
          ref={sectionRef}
          className={`max-w-6xl mx-auto px-6 md:px-10 transform transition-all duration-1000
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className='max-w-3xl mx-auto text-center mb-20'>
            <span className='px-4 py-2 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-sm mb-4 inline-block'>
              PARTNER WITH US
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Take the weight off your wallet and your mind.
            </h2>
            <p className='text-xl text-gray-600 leading-relaxed'>
              Financial therapy combines financial know-how with emotional support to help people
              feel and behave better with their money.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='group'>
              <div
                className='bg-white rounded-2xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300'
                onMouseEnter={() => trackStatHover('productivity', '34% increase in productivity')}
              >
                <div className='text-[#9071FF] mb-6'>
                  <Users size={48} />
                </div>
                <h3 className='text-2xl font-bold mb-3'>7 in 10 say financial uncertainty causes anxiety or depression</h3>
                <p className='text-gray-600'>
                  Money stress isn’t just about bills — it affects emotional well-being.
                </p>
              </div>
            </div>

            <div className='group'>
              <div
                className='bg-white rounded-2xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300'
                onMouseEnter={() => trackStatHover('retention', '48% improvement in retention')}
              >
                <div className='text-[#9071FF] mb-6'>
                  <Brain size={48} />
                </div>
                <h3 className='text-2xl font-bold mb-3'>52% say money has a negative impact on their mental health.
                </h3>
                <p className='text-gray-600'>
                  Nearly half say money harms their mental health.
                  
                </p>
                <p className='text-gray-600'>If you’ve ever lost sleep over bills or debt, you’re not alone. 1 in 2 people feel the same.</p>
              </div>
            </div>

            <div className='group'>
              <div
                className='bg-white rounded-2xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300'
                onMouseEnter={() =>
                  trackStatHover('absenteeism', '22% reduction in financial-related absenteeism')
                }
              >
                <div className='text-[#9071FF] mb-6'>
                  <Salad size={48} />
                </div>
                <h3 className='text-2xl font-bold mb-3'>
                  72% of Gen Z are actively trying to improve financial health
                </h3>
                <p className='text-gray-600'>
                  You’re not alone, most of your generation is working toward the same goal: better financial health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BusinessImpactSection;
