import { Lightbulb, Rocket, Star, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

import PersonalActionableInsights from './insights/PersonalActionableInsights';
import PersonalGoalsTracker from './insights/PersonalGoalsTracker';
import ProgressComparisonChart from './insights/ProgressComparisonChart';

export default function ComingSoon() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      icon: Lightbulb,
      title: 'Personalized Insights',
      description: 'Tailored financial recommendations based on your unique journey.',
      color: 'text-yellow-500',
      component: <PersonalActionableInsights />,
    },
    {
      icon: Rocket,
      title: 'Goal Tracking',
      description: 'Visualize and accelerate your path to financial success.',
      color: 'text-purple-500',
      component: <PersonalGoalsTracker />,
    },
    {
      icon: Star,
      title: 'Advanced Analytics',
      description: 'Deep dive into your financial phabits and potential.',
      color: 'text-blue-500',
      component: <ProgressComparisonChart />,
    },
  ];

  const toggleFeature = (title: string) => {
    setActiveFeature(activeFeature === title ? null : title);
  };

  return (
    <div className='md:col-span-8 space-y-8 md:space-y-12 md:order-1'>
      <div className='bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 md:p-8 border border-purple-100 shadow-sm'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-800'>
            Coming Soon: Your Financial Evolution
          </h2>
          <div className='bg-purple-100 p-2 rounded-full'>
            <Rocket className='w-6 h-6 text-purple-600 animate-pulse' />
          </div>
        </div>

        <p className='text-gray-600 mb-6 max-w-2xl'>
          We're working on transformative features to elevate your financial wellness journey. Get
          ready for personalized insights, advanced goal tracking, and powerful analytics.
        </p>

        <div className='grid md:grid-cols-3 gap-4'>
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                activeFeature === feature.title ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => toggleFeature(feature.title)}
            >
              <div className='flex justify-between items-center'>
                <div className={`${feature.color}`}>
                  <feature.icon className='w-8 h-8' />
                </div>
                {activeFeature === feature.title ? (
                  <ChevronUp className='text-gray-500' />
                ) : (
                  <ChevronDown className='text-gray-500' />
                )}
              </div>
              <h3 className='font-semibold text-gray-800 mb-2'>{feature.title}</h3>
              <p className='text-gray-600 text-sm mb-4'>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Expanded Feature Content */}
        {activeFeature && (
          <div className='mt-6 p-4 bg-purple-50 rounded-xl'>
            {features.find((f) => f.title === activeFeature)?.component}
          </div>
        )}

        <div className='mt-6 text-center'>
          <p className='text-gray-500 italic text-sm'>
            Stay tuned! These features are being crafted with care to empower your financial
            journey.
          </p>
        </div>
      </div>
    </div>
  );
}
