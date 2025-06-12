'use client';

import ChatSection from './ChatSection';
import { SharedDocumentsSection } from './SharedDocumentsSection';
import SharePanel from './SharePanel';
import TherapistRecommendationsWithOverlay from './TherapistRecommendationsWithOverlay';
import { UpcomingSessionsSection } from './UpcomingSessionsSection';
import VideoLibrary from './VideoLibrary';

interface DashboardContentProps {
  hasCompletedQuiz: boolean;
  onTakeQuizClick: () => void;
  onShareClick: () => void;
  referralLink: string;
  setIsFinancialTherapyModalOpen: (isOpen: boolean) => void;
}

export function DashboardContent({
  hasCompletedQuiz,
  onTakeQuizClick,
  onShareClick,
  referralLink,
  setIsFinancialTherapyModalOpen,
}: DashboardContentProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'>
      {/* Main content column */}
      <div className='md:col-span-2 space-y-8'>
        {/* Card with subtle hover effect */}
        <div
          className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 
          overflow-hidden border border-gray-100 animate-fade-in-up delay-100'
        >
          <div className='p-6'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
              <span className='bg-blue-100 p-2 rounded-lg mr-3'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-blue-600'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                    clipRule='evenodd'
                  />
                </svg>
              </span>
              Your Upcoming Sessions
            </h3>
            <UpcomingSessionsSection />
          </div>
        </div>

        {/* Therapist recommendations with overlay */}
        <div
          className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 
          overflow-hidden border border-gray-100 animate-fade-in-up delay-200'
        >
          <div className='p-6'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
              <span className='bg-purple-100 p-2 rounded-lg mr-3'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 text-purple-600'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
                </svg>
              </span>
              Recommended Financial Therapists
            </h3>
            <TherapistRecommendationsWithOverlay
              onTakeQuizClick={onTakeQuizClick}
              hasCompletedQuiz={hasCompletedQuiz}
            />
          </div>
        </div>

        {/* Chat Section */}
        <ChatSection />

        {/* Shared Documents Section */}
        <div className='animate-fade-in-up delay-300'>
          <SharedDocumentsSection />
        </div>
      </div>

      {/* Share link panel and resources */}
      <div className='md:col-span-1 space-y-6'>
        {/* Share Panel */}
        <SharePanel onShareClick={onShareClick} referralLink={referralLink} />

        {/* Additional resources card */}
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <h3 className='font-semibold text-gray-800 mb-3'>Additional Resources</h3>
          <p className='text-gray-600'>
            Want to learn more about financial therapy? Check out our resources below.
          </p>
          <button
            onClick={() => setIsFinancialTherapyModalOpen(true)}
            className='w-full mt-4 bg-purple-600 text-white py-3 rounded-lg 
              hover:bg-purple-700 transition-colors duration-300 
              flex items-center justify-center font-semibold 
              shadow-md hover:shadow-lg'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
            Learn More About Financial Therapy
          </button>
        </div>

        {/* Video Library - Extracted to a separate component */}
        <VideoLibrary />
      </div>
    </div>
  );
}
