'use client';

import { Frown, HeartHandshake, PieChart, TrendingUp, Users } from 'lucide-react';
import { useRef } from 'react';

import { journeySectionTitleSignal } from '@/src/features/utm/utmCustomDemo';

import { trackSectionView, trackUIInteraction, useViewTracker } from '../../posthog/tracking';

import JourneyStep from '../interactive/JourneyStep';
import { JourneyStep as JourneyStepType } from '../../types';

const journeySteps: JourneyStepType[] = [
  {
    icon: Frown,
    title: 'Day 1: Hitting a Wall',
    description:
      "Jasmine sits at her desk, the bills and debt weighing on her mind. She wonders, 'Is it just me?' That night, she discovers financial therapy. For employers, these silent struggles can quietly erode focus and productivity across the team.",
    hrInsight: 'Financial stress decreases productivity by up to 34%',
    bg: 'bg-white',
    image: 'https://d2qcuj7ucxw61o.cloudfront.net/hitting_the_wall.jpg',
  },
  {
    icon: HeartHandshake,
    title: 'Week 1: Opening Up',
    description:
      "Jasmine feels fortunate her employer offered a safe, private space to talk about money. In her first session, she's surprised by how comfortable it feels to open up. When employees feel supported, they bring more of themselves to work.",
    hrInsight: '87% of employees want financial wellness support beyond basic education',
    bg: 'bg-[#f9f8ff]',
    image: 'https://d2qcuj7ucxw61o.cloudfront.net/opening_up.jpg',
    therapistImage: 'https://d2qcuj7ucxw61o.cloudfront.net/GeorgeBlount.jpg',
  },
  {
    icon: PieChart,
    title: 'Week 2: Noticing Patterns, Together',
    description:
      "Renavest's AI flags moments in Jasmine's spending worth exploring. With these insights, her financial therapist helps her connect habits to feelings—making real change possible at work and beyond.",
    hrInsight: 'Employees with financial wellness support are 2x more productive',
    bg: 'bg-white',
  },
  {
    icon: TrendingUp,
    title: 'Month 1: Small Wins, Real Change',
    description:
      "Jasmine celebrates her first emergency fund—it's not huge, but it's hers. The anxiety doesn't vanish overnight, but with her financial therapist's support, she feels lighter, more hopeful. These small wins add up to greater engagement and resilience at work.",
    hrInsight: 'Companies offering financial therapy see up to 13% reduction in turnover',
    bg: 'bg-[#f9f8ff]',
    image: 'https://d2qcuj7ucxw61o.cloudfront.net/after_financial_therapy.jpg',
    therapistImage: 'https://d2qcuj7ucxw61o.cloudfront.net/GeorgeBlount.jpg',
  },
  {
    icon: Users,
    title: 'Quarter 1: A New Chapter',
    description:
      "Jasmine's manager notices she's more focused, more present. Jasmine feels it too—she's not just surviving, she's starting to thrive. For employers, that means a team that's more engaged, loyal, and ready to grow.",
    hrInsight: 'Employees with reduced financial stress utilize all benefits 28% more effectively',
    bg: 'bg-white',
    image: 'https://d2qcuj7ucxw61o.cloudfront.net/final_image.jpg',
  },
];

function AnimatedInsight({ children, index }: { children: React.ReactNode; index: number }) {
  const insightRef = useRef<HTMLDivElement>(null);

  // Track insight view when it becomes visible
  useViewTracker(insightRef, () =>
    trackUIInteraction('journey_insight_viewed', `insight_${index}`, {
      insight_text: children?.toString(),
    }),
  );

  return (
    <div
      ref={insightRef}
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

  // Track section view when it becomes visible
  useViewTracker(sectionRef, () => trackSectionView('jasmine_journey'));

  return (
    <>
      <span id='jasmine-journey' className='block scroll-mt-16'></span>
      <section
        ref={sectionRef}
        className='w-full flex flex-col items-center py-12 md:py-16 bg-[#F9F9F7]'
      >
        <div className='max-w-7xl w-full px-4 md:px-10 mb-12 md:mb-20'>
          <div className='max-w-3xl mx-auto text-center'>
            <span className='px-4 md:px-6 py-1.5 md:py-2.5 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-xs md:text-sm mb-4 md:mb-6 inline-block'>
              EMPLOYEE JOURNEY
            </span>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight'>
              {journeySectionTitleSignal.value}
            </h2>
            <h3 className='text-base md:text-xl lg:text-2xl text-gray-700 mb-0 font-medium px-2 md:px-0'>
              88% of employees bring money worries to work. Jasmine was one of them—until she found
              a financial therapist who listened. When employees feel supported, they show up
              differently for your business.
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
