'use client';
import { ArrowDownUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ElementType } from 'react';

import DataCardExample from './DataCardExample';
import type { JourneySectionProps } from './types';

// Types for the extracted components
type AnimatedTitleProps = {
  title: string;
  isVisible: boolean;
  animationDelay: string;
  icon: ElementType;
};

type AnimatedHeadingProps = {
  title: string;
  isVisible: boolean;
  animationDelay: string;
};

type AnimatedDescriptionProps = {
  description: string;
  isVisible: boolean;
  animationDelay: string;
};

type ContentDisplayProps = {
  icon: ElementType;
  title: string;
  description: string;
  isVisible: boolean;
  animationDelay: string;
};

// Extract animation components to reduce main component size
const AnimatedTitle = ({ title, isVisible, animationDelay, icon: Icon }: AnimatedTitleProps) => (
  <span
    className={`
      inline-flex items-center gap-2 text-[#9071FF] font-medium mb-3 text-sm
      transition-all duration-700 delay-200
      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
    `}
    style={{ transitionDelay: `calc(${animationDelay} + 0.1s)` }}
  >
    <Icon size={20} />
    {title.split(':')[0]}
  </span>
);

const AnimatedHeading = ({ title, isVisible, animationDelay }: AnimatedHeadingProps) => (
  <h2
    className={`
      text-2xl md:text-3xl font-bold mb-4 text-gray-900
      transform transition-all duration-700
      ${isVisible ? 'scale-100 translate-x-0' : 'scale-95 -translate-x-6'}
    `}
    style={{ transitionDelay: `calc(${animationDelay} + 0.2s)` }}
  >
    {title.split(':')[1] || ''}
  </h2>
);

const AnimatedDescription = ({
  description,
  isVisible,
  animationDelay,
}: AnimatedDescriptionProps) => (
  <p
    className={`
      text-lg text-gray-600 leading-relaxed
      transition-all duration-700
      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
    `}
    style={{ transitionDelay: `calc(${animationDelay} + 0.3s)` }}
  >
    {description}
  </p>
);

const ContentDisplay = ({
  icon: Icon,
  title,
  description,
  isVisible,
  animationDelay,
}: ContentDisplayProps) => (
  <div
    className={`
      relative z-10 flex flex-col items-center justify-center p-8 text-center 
      transform group-hover:scale-105 transition-transform duration-500
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}
    style={{ transitionDelay: `calc(${animationDelay} + 0.7s)` }}
  >
    <div
      className={`
        bg-[#9071FF]/10 rounded-full p-4 mb-6 
        transform group-hover:rotate-12 transition-transform duration-500 ease-in-out
        ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-45'}
      `}
      style={{ transitionDelay: `calc(${animationDelay} + 0.8s)` }}
    >
      <Icon className='text-[#9071FF]' size={56} />
    </div>
    <h3
      className={`
        text-xl font-semibold text-gray-800 mb-3
        transition-all duration-700
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `calc(${animationDelay} + 0.9s)` }}
    >
      {title.split(':')[1] || ''}
    </h3>
    <p
      className={`
        text-gray-600
        transition-all duration-700
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `calc(${animationDelay} + 1s)` }}
    >
      {description}
    </p>
  </div>
);

function JourneyStep({ step, idx }: JourneySectionProps) {
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (elementRef) {
      observer.observe(elementRef);
    }

    return () => {
      if (elementRef) {
        observer.unobserve(elementRef);
      }
    };
  }, [elementRef]);

  const animationDelay = `${idx * 0.2}s`;

  const renderImage = () => {
    if (step.title === 'Week 2: Noticing Patterns, Together') {
      return <DataCardExample />;
    }

    return step.image ? (
      <img
        src={step.image}
        alt={step.title}
        className='w-full h-full object-cover rounded-3xl shadow-md'
        style={{ transitionDelay: `calc(${animationDelay} + 0.4s)` }}
      />
    ) : null;
  };

  return (
    <div
      ref={setElementRef}
      className={`
        w-full px-4 py-10 md:px-20 md:py-14 ${step.bg || 'bg-white'} rounded-3xl shadow-md hover:shadow-xl
        transform transition-all duration-1000
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

      {/* Simplified view for mobile */}
      <div className='lg:hidden flex flex-col items-center'>
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

export default JourneyStep;
