'use client';
import { ArrowDownUp } from 'lucide-react';
import React, { useEffect, useState, memo } from 'react';
import type { ElementType } from 'react';

import type {
  JourneySectionProps,
  AnimatedTitleProps,
  AnimatedHeadingProps,
  AnimatedDescriptionProps,
} from '../../types';

import DataCardExample from './DataCardExample';

// Memoized components to reduce re-renders
const AnimatedTitle = memo(
  ({ title, isVisible, animationDelay, icon: Icon }: AnimatedTitleProps) => (
    <span
      className={`
      inline-flex items-center gap-2 text-[#9071FF] font-medium mb-3 text-sm
      transition-opacity duration-500 ease-in-out
      ${isVisible ? 'opacity-100' : 'opacity-0'}
    `}
      style={{ transitionDelay: `calc(${animationDelay} + 0.1s)` }}
    >
      <Icon size={20} />
      {title.split(':')[0]}
    </span>
  ),
);

const AnimatedHeading = memo(({ title, isVisible, animationDelay }: AnimatedHeadingProps) => (
  <h2
    className={`
      text-2xl md:text-3xl font-bold mb-4 text-gray-900
      transition-all duration-500 ease-in-out
      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
    `}
    style={{ transitionDelay: `calc(${animationDelay} + 0.2s)` }}
  >
    {title.split(':')[1] || ''}
  </h2>
));

const AnimatedDescription = memo(
  ({ description, isVisible, animationDelay }: AnimatedDescriptionProps) => (
    <p
      className={`
      text-lg text-gray-600 leading-relaxed
      transition-all duration-500 ease-in-out
      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
    `}
      style={{ transitionDelay: `calc(${animationDelay} + 0.3s)` }}
    >
      {description}
    </p>
  ),
);

function JourneyStep({ step, idx }: JourneySectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Use passive intersection observer for better performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      },
    );

    const currentTarget = document.querySelector(`#journey-step-${idx}`);
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [idx]);

  const animationDelay = `${idx * 0.2}s`;

  const renderImage = React.useCallback(() => {
    if (step.title === 'Week 2: Noticing Patterns, Together') {
      return <DataCardExample />;
    }

    return step.image ? (
      <img
        src={step.image}
        alt={step.title}
        className='w-full h-full object-cover rounded-3xl shadow-md'
        loading='lazy'
      />
    ) : null;
  }, [step]);

  return (
    <div
      id={`journey-step-${idx}`}
      className={`
        w-full px-4 py-10 md:px-20 md:py-14 ${step.bg || 'bg-white'} rounded-3xl shadow-md hover:shadow-xl
        transform transition-all duration-700
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}
      `}
      style={{ transitionDelay: animationDelay }}
    >
      {/* Animated view for larger screens */}
      <div className='hidden lg:flex flex-row items-center gap-16'>
        <div className={`w-1/2 ${idx % 2 === 1 ? 'order-2' : 'order-1'}`}>
          <div className='max-w-xl'>
            <AnimatedTitle
              title={step.title}
              isVisible={isVisible}
              animationDelay={animationDelay}
              icon={step.icon}
            />
            <AnimatedHeading
              title={step.title}
              isVisible={isVisible}
              animationDelay={animationDelay}
            />
            <AnimatedDescription
              description={step.description}
              isVisible={isVisible}
              animationDelay={animationDelay}
            />
          </div>
        </div>

        <div className={`w-1/2 ${idx % 2 === 1 ? 'order-1' : 'order-2'} flex justify-center`}>
          <div className='relative w-[380px] h-[380px]'>
            {renderImage()}
            {step.title === 'Week 1: Opening Up' && step.therapistImage && (
              <>
                <img
                  src={step.therapistImage}
                  alt='Financial Therapist'
                  className='absolute top-4 right-4 w-24 h-24 object-cover rounded-lg border-4 border-white shadow-lg z-10'
                  style={{ transitionDelay: `calc(${animationDelay} + 0.5s)` }}
                />
                <ArrowDownUp
                  size={64}
                  height={300}
                  width={64}
                  strokeWidth={2.5}
                  color='#B9A7E6'
                  className='absolute right-6 bottom-10 z-10'
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(185,167,230,0.15))' }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className='lg:hidden'>
        <div className='w-full text-center mb-6'>
          <span className='inline-flex items-center gap-2 text-[#9071FF] font-medium mb-3 text-sm'>
            {step.icon && <step.icon size={20} />}
            {step.title.split(':')[0]}
          </span>
          <h2 className='text-2xl font-bold mb-4 text-gray-900'>
            {step.title.split(':')[1] || ''}
          </h2>
          <p className='text-base text-gray-600 leading-relaxed px-4'>{step.description}</p>
        </div>

        <div className='w-full flex justify-center'>
          <div className='relative w-[250px] h-[250px]'>
            {renderImage()}
            {step.title === 'Week 1: Opening Up' && step.therapistImage && (
              <img
                src={step.therapistImage}
                alt='Financial Therapist'
                className='absolute top-4 right-4 w-16 h-16 object-cover rounded-lg border-2 border-white shadow-lg z-10'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(JourneyStep);