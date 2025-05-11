'use client';

import { TrendingUp, Users, Shield } from 'lucide-react';
import posthog from 'posthog-js';
import { useEffect, useState, useRef } from 'react';
import { Parallax } from 'react-scroll-parallax';

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
          <Parallax
            translateY={[-15, 15]}
            opacity={[0.8, 1]}
            className='max-w-3xl mx-auto text-center mb-20'
          >
            <span className='px-4 py-2 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-sm mb-4 inline-block'>
              THE BUSINESS IMPACT
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              When Financial Stress Disappears, Performance Soars
            </h2>
            <p className='text-xl text-gray-600 leading-relaxed'>
              Financial therapy is more than a benefit—it's a strategic investment in your team's
              potential. By addressing financial stress, you unlock unprecedented workplace
              performance.
            </p>
          </Parallax>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <Parallax translateY={[20, -20]} scale={[0.9, 1]} className='group'>
              <div
                className='bg-white rounded-2xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300'
                onMouseEnter={() => trackStatHover('productivity', '34% increase in productivity')}
              >
                <div className='text-[#9071FF] mb-6'>
                  <TrendingUp size={48} />
                </div>
                <h3 className='text-2xl font-bold mb-3'>34% increase in productivity</h3>
                <p className='text-gray-600'>
                  Financial therapists can help alleviate mental load, freeing employees to focus on
                  their core responsibilities.
                </p>
              </div>
            </Parallax>

            <Parallax translateY={[30, -30]} scale={[0.9, 1]} className='group'>
              <div
                className='bg-white rounded-2xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300'
                onMouseEnter={() => trackStatHover('retention', '48% improvement in retention')}
              >
                <div className='text-[#9071FF] mb-6'>
                  <Users size={48} />
                </div>
                <h3 className='text-2xl font-bold mb-3'>48% improvement in retention</h3>
                <p className='text-gray-600'>
                  Employees who feel supported in their financial wellness are significantly more
                  likely to stay with their employer.
                </p>
              </div>
            </Parallax>

            <Parallax translateY={[40, -40]} scale={[0.9, 1]} className='group'>
              <div
                className='bg-white rounded-2xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300'
                onMouseEnter={() =>
                  trackStatHover('absenteeism', '22% reduction in financial-related absenteeism')
                }
              >
                <div className='text-[#9071FF] mb-6'>
                  <Shield size={48} />
                </div>
                <h3 className='text-2xl font-bold mb-3'>
                  22% reduction in financial-related absenteeism
                </h3>
                <p className='text-gray-600'>
                  Financial wellness programs directly correlate with reduced stress-related sick
                  days and absences.
                </p>
              </div>
            </Parallax>
          </div>
        </div>
      </section>
    </>
  );
}

export default BusinessImpactSection;
