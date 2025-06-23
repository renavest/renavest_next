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
          <h3 className='text-lg font-medium text-[#9071FF]'>Licensed Financial Therapy</h3>
        </div>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>
          Beyond Surface-Level Financial Advice
        </h2>
        <p className='text-gray-700 mb-6'>
          Connect employees with qualified financial therapists who understand the deep emotional
          roots of financial stress. We go deeper than just budgeting tips, leveraging AI-powered
          matching and personalized digital tools to create lasting financial wellness.
        </p>
      </div>
      <div className='md:w-1/2 bg-[#f9f8ff] rounded-lg p-6'>
        <div className='bg-white rounded-lg shadow-md p-5'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-[#9071FF] rounded-full flex items-center justify-center text-white'>
              <HeartHandshake size={20} />
            </div>
            <div>
              <p className='font-medium'>AI-Enhanced Therapy</p>
              <p className='text-sm text-gray-500'>Intelligent Support</p>
            </div>
          </div>
          <div className='mb-3'>
            <p className='text-sm text-gray-500'>AI Matching Accuracy</p>
            <p className='font-medium'>92% Personalization Rate</p>
          </div>
          <div className='flex justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Key Focus</p>
              <p className='text-[#9071FF] font-medium'>Debt Anxiety</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Improvement</p>
              <p className='text-green-600 font-medium'>87%</p>
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
          <h3 className='text-lg font-medium text-[#9071FF]'>Clear ROI for Companies</h3>
        </div>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>Measurable Business Impact</h2>
        <p className='text-gray-700 mb-6'>
          When companies tackle financial stress with Renavest, they see real results: up to 13%
          reduced turnover, 34% higher productivity, and 22% less absenteeism.
        </p>
      </div>
      <div className='md:w-1/2 bg-[#f9f8ff] rounded-lg p-6'>
        <div className='bg-white rounded-lg shadow-md p-5'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-[#9071FF] rounded-full flex items-center justify-center text-white'>
              <TrendingUp size={20} />
            </div>
            <div>
              <p className='font-medium'>Business Metrics</p>
              <p className='text-sm text-gray-500'>Quarterly Impact</p>
            </div>
          </div>
          <div className='mb-3'>
            <p className='text-sm text-gray-500'>Performance</p>
            <p className='font-medium'>Employee Productivity +34%</p>
          </div>
          <div className='flex justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Retention</p>
              <p className='text-[#9071FF] font-medium'>+13%</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Absenteeism</p>
              <p className='text-green-600 font-medium'>-22%</p>
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
          <h3 className='text-lg font-medium text-[#9071FF]'>Workforce Financial Insights</h3>
        </div>
        <h2 className='text-2xl md:text-3xl font-bold mb-4'>Anonymized Data Analytics</h2>
        <p className='text-gray-700 mb-6'>
          Provide employers with confidential, aggregated data to understand financial stress themes
          like "Anxiety about Down Payments" or "Rising Cost of Living" concerns.
        </p>
      </div>
      <div className='md:w-1/2 bg-[#f9f8ff] rounded-lg p-6'>
        <div className='bg-white rounded-lg shadow-md p-5'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 bg-[#9071FF] rounded-full flex items-center justify-center text-white'>
              <BarChart3 size={20} />
            </div>
            <div>
              <p className='font-medium'>Stress Themes</p>
              <p className='text-sm text-gray-500'>Confidential Insights</p>
            </div>
          </div>
          <div className='mb-3'>
            <p className='text-sm text-gray-500'>Key Finding</p>
            <p className='font-medium'>30% experiencing Down Payment Anxiety</p>
          </div>
          <div className='flex justify-between'>
            <div>
              <p className='text-sm text-gray-500'>Department</p>
              <p className='text-[#9071FF] font-medium'>Sales</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Action</p>
              <p className='text-green-600 font-medium'>Workshop</p>
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
      posthog.capture('section:viewed_v1', {
        section_name: 'what_we_do',
        url: window.location.href,
        visibility_timestamp: new Date().toISOString(),
      });
    }
  });

  // Track card selection in PostHog
  const trackCardSelection = (cardNumber: number) => {
    if (typeof window !== 'undefined') {
      posthog.capture('what_we_do:card_selected', {
        card_number: cardNumber,
        section: 'what_we_do',
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
              What Renavest Delivers
            </h2>
            <p className='text-xl text-gray-600 leading-relaxed'>
              Purpose-built features for healing your relationship with money.
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
