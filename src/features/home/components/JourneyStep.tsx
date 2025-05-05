'use client';
import { useEffect, useState } from 'react';
import type { ElementType } from 'react';

import DataCardExample from './DataCardExample';
import { JourneySectionProps } from './types';

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

  return (
    <div
      ref={setElementRef}
      className={`
        w-full px-8 py-14 md:p-20 bg-white rounded-3xl shadow-md hover:shadow-xl
        transform transition-all duration-1000
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}
      `}
      style={{ transitionDelay: animationDelay }}
    >
      <div className='flex flex-col md:flex-row items-center gap-16'>
        <div className={`w-full md:w-1/2 ${idx % 2 === 1 ? 'md:order-2' : 'md:order-1'}`}>
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

        <div
          className={`w-full md:w-1/2 ${idx % 2 === 1 ? 'md:order-1' : 'md:order-2'} flex justify-center`}
        >
          <div className='relative w-[300px] h-[300px] md:w-[380px] md:h-[380px]'>
            {step.title === 'Week 2: Noticing Patterns, Together' ? (
              <DataCardExample />
            ) : step.image ? (
              <img
                src={step.image}
                alt={step.title}
                className='w-full h-full object-cover rounded-3xl shadow-md'
                style={{ transitionDelay: `calc(${animationDelay} + 0.4s)` }}
              />
            ) : (
              <video
                src='/videos/example_vid.mp4'
                autoPlay
                loop
                muted
                playsInline
                className='hidden md:block w-full h-full object-cover rounded-3xl shadow-md'
                style={{ transitionDelay: `calc(${animationDelay} + 0.4s)` }}
              />
            )}
            <div
              className={`block md:hidden bg-[#F9F9F7] rounded-3xl flex items-center justify-center group shadow-md hover:shadow-lg transition-all duration-700 w-full h-full
                transform ${isVisible ? 'scale-100 rotate-0' : 'scale-90 rotate-3'}`}
              style={{ transitionDelay: `calc(${animationDelay} + 0.4s)` }}
            >
              <ContentDisplay
                icon={step.icon}
                title={step.title}
                description={step.description}
                isVisible={isVisible}
                animationDelay={animationDelay}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JourneyStep;
