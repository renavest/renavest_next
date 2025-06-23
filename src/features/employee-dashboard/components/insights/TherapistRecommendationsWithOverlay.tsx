'use client';

import { ClipboardList } from 'lucide-react';

import TherapistRecommendations from './insights/TherapistRecommendations';

interface TherapistRecommendationsWithOverlayProps {
  onTakeQuizClick: () => void;
  hasCompletedQuiz: boolean;
}

const TherapistRecommendationsWithOverlay = ({
  onTakeQuizClick,
  hasCompletedQuiz,
}: TherapistRecommendationsWithOverlayProps) => {
  if (hasCompletedQuiz) {
    // Show enhanced recommendations without overlay
    return <TherapistRecommendations showViewAllButton={true} />;
  }

  return (
    <div className='relative rounded-lg overflow-hidden'>
      {/* The actual recommendations component with reduced opacity */}
      <div className='opacity-25 pointer-events-none'>
        <TherapistRecommendations />
      </div>

      {/* Overlay content */}
      <div className='absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] p-8 text-center'>
        <ClipboardList className='h-10 w-10 text-purple-600 mb-4' />
        <h4 className='text-xl font-semibold text-gray-800 mb-2'>
          Want to See Your Recommended Therapists?
        </h4>
        <p className='text-gray-600 mb-5 max-w-md'>
          Take our short quiz to get personalized therapist recommendations based on your unique
          financial goals.
        </p>
        <button
          onClick={onTakeQuizClick}
          className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-medium'
        >
          Take the Quiz Now
        </button>
      </div>
    </div>
  );
};

export default TherapistRecommendationsWithOverlay;
