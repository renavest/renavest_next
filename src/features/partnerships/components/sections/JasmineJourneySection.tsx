'use client';

import { Frown, HeartHandshake, PieChart, TrendingUp, Users } from 'lucide-react';
import React, { useRef } from 'react';

import { journeySectionTitleSignal } from '@/src/features/utm/utmCustomDemo';

import { trackSectionView } from '../../utils/trackingUtils';

import JourneyStep from '../interactive/JourneyStep';

const journeySteps = [
  {
    icon: Frown,
    title: 'Phase 1: Partner Discovery',
    description:
      "We begin by understanding your organization's unique needs and goals. Whether you're a financial therapist looking to expand your practice, or a wellness platform seeking to add financial therapy services, we work together to identify the best partnership model.",
    hrInsight: 'Customized partnership solutions for every organization type',
    bg: 'bg-white',
    image: 'https://d2qcuj7ucxw61o.cloudfront.net/hitting_the_wall.jpg',
  },
  {
    icon: HeartHandshake,
    title: 'Phase 2: Integration Planning',
    description:
      "Our team collaborates with yours to design the perfect integration. From API connections to white-label solutions, we ensure seamless implementation that aligns with your brand and business model.",
    hrInsight: 'Seamless integration with existing platforms and workflows',
    bg: 'bg-[#f9f8ff]',
    image: 'https://d2qcuj7ucxw61o.cloudfront.net/opening_up.jpg',
    therapistImage: 'https://d2qcuj7ucxw61o.cloudfront.net/GeorgeBlount.jpg',
  },
  {
    icon: PieChart,
    title: 'Phase 3: Launch & Support',
    description:
      "We provide comprehensive training, marketing support, and ongoing technical assistance to ensure your partnership succeeds. Our dedicated partner success team is with you every step of the way.",
    hrInsight: 'Dedicated support team ensures partnership success',
    bg: 'bg-white',
  },
  {
    icon: TrendingUp,
    title: 'Phase 4: Scale & Growth',
    description:
      "As your partnership grows, we continue to innovate together. Regular performance reviews, feature updates, and expansion opportunities ensure both organizations benefit from our collaboration.",
    hrInsight: 'Continuous innovation and growth opportunities for partners',
    bg: 'bg-[#f9f8ff]',
    image: 'https://d2qcuj7ucxw61o.cloudfront.net/after_financial_therapy.jpg',
    therapistImage: 'https://d2qcuj7ucxw61o.cloudfront.net/GeorgeBlount.jpg',
  },
  {
    icon: Users,
    title: 'Phase 5: Long-term Success',
    description:
      "Together, we create lasting impact in the financial wellness space. Our partnerships drive innovation, expand access to financial therapy, and help more people build healthier relationships with money.",
    hrInsight: 'Long-term partnerships create lasting impact in financial wellness',
    bg: 'bg-white',
    image: 'https://d2qcuj7ucxw61o.cloudfront.net/final_image.jpg',
  },
];

function AnimatedInsight({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <div
      className={`transition-all duration-[1200ms] ease-out transform
        flex justify-center my-12`}
    >
      <span className='inline-block bg-[#F3F0FF] text-[#9071FF] px-10 py-5 rounded-full font-medium text-lg shadow-sm'>
        {children}
      </span>
    </div>
  );
}

function JasmineJourneySection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Track section view when component mounts
  React.useEffect(() => {
    trackSectionView('partnerships_journey');
  }, []);

  return (
    <>
      <span id='partnerships-journey' className='block scroll-mt-16'></span>
      <section
        ref={sectionRef}
        className='w-full flex flex-col items-center py-12 md:py-16 bg-[#F9F9F7]'
      >
        <div className='max-w-7xl w-full px-4 md:px-10 mb-12 md:mb-20'>
          <div className='max-w-3xl mx-auto text-center'>
            <span className='px-4 md:px-6 py-1.5 md:py-2.5 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-xs md:text-sm mb-4 md:mb-6 inline-block'>
              PARTNERSHIP JOURNEY
            </span>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight'>
              Your Path to Partnership Success
            </h2>
            <h3 className='text-base md:text-xl lg:text-2xl text-gray-700 mb-0 font-medium px-2 md:px-0'>
              From initial discovery to long-term growth, we're committed to building partnerships that create real value for both organizations and the people we serve.
            </h3>
          </div>
        </div>

        <div className='w-full max-w-[90rem] px-4 md:px-16'>
          <div className='space-y-8 md:space-y-0'>
            {journeySteps.map((step, idx) => (
              <div key={step.title} className='flex flex-col'>
                <JourneyStep step={step} idx={idx} />
                {idx < journeySteps.length - 1 && step.hrInsight && (
                  <AnimatedInsight index={idx}>{step.hrInsight}</AnimatedInsight>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default JasmineJourneySection;