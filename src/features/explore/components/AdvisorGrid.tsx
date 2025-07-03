'use client';
import React from 'react';

import OnboardingModalServerWrapper from '../../onboarding/components/OnboardingModalServerWrapper';
import { advisorActions } from '../state/exploreState';
import { Advisor } from '../types';

import AdvisorModal from './AdvisorModal';
import VerticalAdvisorCard from './HorizontalAdvisorCard';

const AdvisorGrid: React.FC<{ advisors: Advisor[] }> = ({ advisors }) => {
  // Set advisors in global state when component receives them
  React.useEffect(() => {
    if (advisors.length > 0) {
      advisorActions.setAdvisors(advisors);
    }
  }, [advisors]);

  return (
    <OnboardingModalServerWrapper>
      <div className='max-w-4xl mx-auto px-3 sm:px-6 lg:px-8'>
        <div className='space-y-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {advisors.map((advisor, index) => (
              <VerticalAdvisorCard
                key={advisor.id}
                advisor={advisor}
                priority={index < 3} // Priority load first 3 images
              />
            ))}
          </div>
        </div>

        {/* The AdvisorPopover now reads its state from signals */}
        <AdvisorModal />
      </div>
    </OnboardingModalServerWrapper>
  );
};

export default AdvisorGrid;
