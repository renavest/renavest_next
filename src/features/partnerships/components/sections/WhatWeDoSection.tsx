'use client';

import { signal, effect } from '@preact-signals/safe-react';
import { HeartHandshake, TrendingUp, BarChart3 } from 'lucide-react';
import posthog from 'posthog-js';
import { useState } from 'react';

// Card content components to reduce main component size
const CardOne = () => (
  <div className='bg-white rounded-xl shadow-lg p-8 md:p-12'>
    <div className='flex flex-col md:flex-row gap-8 md:gap-20'>
      <div className='md:w-1/2'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-8 h-8 bg-[#9071FF] rounded-full flex items-center justify-center text-white font-bold'>
            1
          </div>
          <h3 className='text-lg font-medium text-[#9071FF]'>Therapist Network</h3>
        </div>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>
          Join Our Certified Financial Therapist Network
        </h2>
        <p className='text-gray-700 mb-6'>
          Connect with more clients who need your expertise. Our AI-powered matching system ensures you work with clients who are the best fit for your specializations and approach.
        </p>
      </div>
      <div className='md:w-1/2 bg-[#f9f8ff] rounded-lg p-6'>
        <div className='bg-white rounded-lg shadow-md p-5'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-[#9071FF] rounded-full flex items-center justify-center text-white'>
              <HeartHandshake size={20} />
            </div>
            <div>
              <p className='font-medium'>Client Matching</p>
              <p className='text-sm text-gray-500'>AI-Enhanced</p>
            </div>
          </div>
          <div className='mb-3'>
            <p className='text-sm text-gray-500'>Match Success Rate</p>
            <p className='font-medium'>94% Client Satisfaction</p>
          </div>
          <div className='flex justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Specialty</p>
              <p className='text-[#9071FF] font-medium'>Debt Therapy</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Availability</p>
              <p className='text-green-600 font-medium'>Open</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CardTwo = () => (
  <div className='bg-white rounded-xl shadow-lg p-8 md:p-12'>
    <div className='flex flex-col md:flex-row gap-8 md:gap-20'>
      <div className='md:w-1/2'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-8 h-8 bg-[#9071FF] rounded-full flex items-center justify-center text-white font-bold'>
            2
          </div>
          <h3 className='text-lg font-medium text-[#9071FF]'>Enterprise Integration</h3>
        </div>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>White-Label Solutions for Enterprise Partners</h2>
        <p className='text-gray-700 mb-6'>
          Integrate our financial therapy platform seamlessly into your existing services. Custom branding, API access, and dedicated support for enterprise partners.
        </p>
      </div>
      <div className='md:w-1/2 bg-[#f9f8ff] rounded-lg p-6'>
        <div className='bg-white rounded-lg shadow-md p-5'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-[#9071FF] rounded-full flex items-center justify-center text-white'>
              <TrendingUp size={20} />
            </div>
            <div>
              <p className='font-medium'>Integration Status</p>
              <p className='text-sm text-gray-500'>Enterprise Ready</p>
            </div>
          </div>
          <div className='mb-3'>
            <p className='text-sm text-gray-500'>Implementation Time</p>
            <p className='font-medium'>2-4 Weeks Average</p>
          </div>
          <div className='flex justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Support</p>
              <p className='text-[#9071FF] font-medium'>24/7</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>SLA</p>
              <p className='text-green-600 font-medium'>99.9%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CardThree = () => (
  <div className='bg-white rounded-xl shadow-lg p-8 md:p-12'>
    <div className='flex flex-col md:flex-row gap-8 md:gap-20'>
      <div className='md:w-1/2'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-8 h-8 bg-[#9071FF] rounded-full flex items-center justify-center text-white font-bold'>
            3
          </div>
          <h3 className='text-lg font-medium text-[#9071FF]'>Wellness Platform Integration</h3>
        </div>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>Add Financial Wellness to Your Platform</h2>
        <p className='text-gray-700 mb-6'>
          Enhance your wellness offerings with comprehensive financial therapy services. Easy API integration, co-branded solutions, and revenue sharing opportunities.
        </p>
      </div>
      <div className='md:w-1/2 bg-[#f9f8ff] rounded-lg p-6'>
        <div className='bg-white rounded-lg shadow-md p-5'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-[#9071FF] rounded-full flex items-center justify-center text-white'>
              <BarChart3 size={20} />
            </div>
            <div>
              <p className='font-medium'>Revenue Share</p>
              <p className='text-sm text-gray-500'>Partnership Model</p>
            </div>
          </div>
          <div className='mb-3'>
            <p className='text-sm text-gray-500'>Integration Type</p>
            <p className='font-medium'>REST API + Webhooks</p>
          </div>
          <div className='flex justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Partner Type</p>
              <p className='text-[#9071FF] font-medium'>Wellness</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Revenue</p>
              <p className='text-green-600 font-medium'>Shared</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function WhatWeDoSection() {
  // Create signals for tracking section visibility
  const isVisible = signal(false);

  // Use useState for active card management
  const [activeCard, setActiveCard] = useState(1);

  // Effect to track section visibility with PostHog
  effect(() => {
    if (isVisible.value && typeof window !== 'undefined') {
      posthog.capture('partnerships_section:viewed_v1', {
        section_name: 'partnerships_what_we_do',
        url: window.location.href,
        visibility_timestamp: new Date().toISOString(),
      });
    }
  });

  // Track card selection in PostHog
  const trackCardSelection = (cardNumber: number) => {
    if (typeof window !== 'undefined') {
      posthog.capture('partnerships_what_we_do:card_selected', {
        card_number: cardNumber,
        section: 'partnerships_what_we_do',
        url: window.location.href,
      });
      setActiveCard(cardNumber);
    }
  };

  // Render the active card based on state
  const renderActiveCard = () => {
    switch (activeCard) {
      case 1:
        return <CardOne />;
      case 2:
        return <CardTwo />;
      case 3:
        return <CardThree />;
      default:
        return <CardOne />;
    }
  };

  return (
    <>
      <span id='what-we-do' className='block scroll-mt-16'></span>
      <section className='w-full py-20 bg-[#f9f8ff]'>
        <div className='max-w-6xl mx-auto px-6 md:px-10'>
          <div className='max-w-4xl mx-auto text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Partnership Opportunities
            </h2>
            <p className='text-xl text-gray-600 leading-relaxed'>
              Multiple ways to collaborate and grow together in the financial wellness space.
            </p>
          </div>

          <div className='max-w-5xl mx-auto mb-16'>
            <div className='flex justify-center gap-4 mb-12'>
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => trackCardSelection(num)}
                  className={`w-12 h-12 rounded-md flex items-center justify-center text-lg font-bold transition-all ${
                    activeCard === num
                      ? 'bg-[#9071FF] text-white'
                      : 'bg-[#f0eeff] text-gray-700 hover:bg-[#e4e0ff]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {renderActiveCard()}
          </div>
        </div>
      </section>
    </>
  );
}

export default WhatWeDoSection;