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
            posthog.capture('partnerships_section:viewed_v1', {
              section_name: 'partnerships_business_impact',
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
      posthog.capture('partnerships_business_impact:stat_hover_v1', {
        stat_name,
        stat_value,
        section: 'partnerships_business_impact',
        url: window.location.href,
        ...userContext,
      });
    }
  };

  return (
    <>
      <span id='business-impact' className='block scroll-mt-16'></span>
      <section className='w-full py-24 bg-[#9071FF]/10'>
        <div
          ref={sectionRef}
          className={`max-w-6xl mx-auto px-6 md:px-10 transform transition-all duration-1000
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className='max-w-3xl mx-auto text-center mb-20'>
            <span className='px-4 py-2 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-sm mb-4 inline-block'>
              PARTNERSHIP OPPORTUNITIES
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Join Us in Transforming Financial Wellness
            </h2>
            <p className='text-xl text-gray-600 leading-relaxed'>
              Partner with Renavest to expand your reach and impact in the financial therapy space.
              Together, we can help more people build healthier relationships with money.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='group'>
              <div
                className='bg-white rounded-2xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300'
                onMouseEnter={() => trackStatHover('therapist_network', 'Expand your practice')}
              >
                <div className='text-[#9071FF] mb-6'>
                  <Users size={48} />
                </div>
                <h3 className='text-2xl font-bold mb-3'>For Financial Therapists</h3>
                <p className='text-gray-600'>
                  Join our network of certified financial therapists and reach more clients who need your expertise.
                  Expand your practice with our AI-powered matching system.
                </p>
              </div>
            </div>

            <div className='group'>
              <div
                className='bg-white rounded-2xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300'
                onMouseEnter={() => trackStatHover('enterprise_partners', 'Scale with corporations')}
              >
                <div className='text-[#9071FF] mb-6'>
                  <Brain size={48} />
                </div>
                <h3 className='text-2xl font-bold mb-3'>For Enterprise Partners</h3>
                <p className='text-gray-600'>
                  Partner with us to offer comprehensive financial wellness solutions to your corporate clients.
                  White-label our platform or integrate with your existing services.
                </p>
              </div>
            </div>

            <div className='group'>
              <div
                className='bg-white rounded-2xl shadow-lg p-8 h-full hover:shadow-xl transition-shadow duration-300'
                onMouseEnter={() =>
                  trackStatHover('wellness_platforms', 'Integrate financial wellness')
                }
              >
                <div className='text-[#9071FF] mb-6'>
                  <Salad size={48} />
                </div>
                <h3 className='text-2xl font-bold mb-3'>
                  For Wellness Platforms
                </h3>
                <p className='text-gray-600'>
                  Add financial therapy to your wellness offerings. Our API and integration tools make it easy
                  to include comprehensive financial wellness in your platform.
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