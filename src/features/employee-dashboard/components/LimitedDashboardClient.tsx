'use client';

import { useUser } from '@clerk/nextjs';
import { ArrowRight, Play, Share2 } from 'lucide-react';
import Image from 'next/image';
import posthog from 'posthog-js';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { companyNameSignal, firstNameSignal } from '@/src/features/utm/utmCustomDemo';
import { trackReferralShare } from '@/src/lib/referralTracking';
import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import ComingSoon from './ComingSoon';
import EmployeeNavbar from './EmployeeNavbar';
import FinancialTherapyModal from './FinancialTherapyModal';
import TherapistRecommendations from './insights/TherapistRecommendations';
import { UpcomingSessionsSection } from './UpcomingSessionsSection';

const SharePanel = ({ onShareClick }: { onShareClick: () => void; referralLink: string }) => {
  return (
    <div
      className={cn(
        'rounded-xl p-6 shadow-sm border animate-fade-in-up',
        'bg-purple-100',
        'border-blue-100 hover:shadow-md transition-shadow duration-300',
        'group', // Added for subtle hover interactions
      )}
    >
      <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
        <Share2 className='w-5 h-5 mr-2 text-purple-600 group-hover:scale-110 transition-transform' />
        Share Renavest
      </h3>
      <p className='text-gray-600 mb-4 text-sm'>
        Help your colleagues {companyNameSignal.value ? `at ${companyNameSignal.value}` : ''}{' '}
        discover financial wellness with Renavest. Share the link and track your impact!
      </p>

      <button
        onClick={onShareClick}
        className='w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 px-4 transition-colors font-medium group'
      >
        <Share2 className='w-4 h-4 mr-2 group-hover:rotate-6 transition-transform' />
        Share Now
      </button>
    </div>
  );
};

export default function LimitedDashboardClient() {
  const { user } = useUser();
  const [referralLink, setReferralLink] = useState('');
  const [isFinancialTherapyModalOpen, setIsFinancialTherapyModalOpen] = useState(false);
  // const [referralsCount, setReferralsCount] = useState(0);

  useEffect(() => {
    if (user && user.id) {
      // Generate personalized referral link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}?ref=${user.id}`;
      setReferralLink(link);

      // Track user in PostHog with proper identification
      posthog.identify(user.id, {
        email: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
      });

      // Track page view
      posthog.capture('employee_dashboard_viewed', {
        userId: user.id,
        userEmail: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
      });
    }
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);

    // Track sharing event with PostHog using the tracking utility
    trackReferralShare(user?.id, 'copy_link', referralLink);

    // Show toast notification
    toast.success('Renavest link copied to clipboard!');
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Renavest - Financial Wellness',
          text: 'Check out Renavest for financial wellness resources and therapy!',
          url: referralLink,
        })
        .then(() => {
          // Track successful share with tracking utility
          trackReferralShare(user?.id, 'native_share', referralLink);

          // Show toast notification
          toast.success('Renavest shared successfully!');
        })
        .catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className={`min-h-screen ${COLORS.WARM_WHITE.bg} font-sans`}>
      {/* Render toast notification */}
      <FinancialTherapyModal
        isOpen={isFinancialTherapyModalOpen}
        onClose={() => setIsFinancialTherapyModalOpen(false)}
      />

      <EmployeeNavbar />
      <main className='container mx-auto px-4 pt-24 md:pt-32 pb-8'>
        {/* Welcome Header with animation */}
        <div className='mb-8 md:mb-10 animate-fade-in-up'>
          <div className='bg-purple-100 rounded-2xl p-6 md:p-8 shadow-sm border border-purple-200'>
            <h2 className='text-3xl md:text-4xl font-bold text-black bg-clip-text'>
              {firstNameSignal.value
                ? `Welcome ${firstNameSignal.value} 👋`
                : user?.firstName
                  ? `Welcome ${user?.firstName} 👋`
                  : 'Welcome 👋'}
            </h2>
            <p className='text-gray-600 mt-2 text-base md:text-lg max-w-2xl animate-fade-in'>
              Your financial wellness journey starts here. Explore resources and connect with expert
              financial therapists.
            </p>
          </div>
        </div>

        {/* Two-column layout */}
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

            {/* Therapist recommendations  with enhanced styling */}
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
                  Expert Financial Therapists
                </h3>
                <TherapistRecommendations />
              </div>
            </div>
          </div>

          {/* Share link panel and resources */}
          <div className='md:col-span-1 space-y-6'>
            {/* Share Panel */}
            <SharePanel onShareClick={handleShareClick} referralLink={referralLink} />

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
            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
              <h3 className='font-semibold text-gray-800 mb-3'>Video Library</h3>
              <div className='flex space-x-4 items-stretch'>
                <div className='relative h-[250px] w-[150px] md:h-[300px] md:w-[200px] lg:h-[250px] lg:w-[150px]'>
                  <Image
                    src='https://d2qcuj7ucxw61o.cloudfront.net/atia_demo.jpg'
                    alt='Financial Therapy Video 1'
                    fill
                    className='object-cover rounded-lg'
                  />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Play className='w-8 h-8 text-white bg-black/50 rounded-full p-2' />
                  </div>
                </div>
                <div className='relative h-[250px] w-[150px]  md:hidden lg:block'>
                  <Image
                    src='https://d2qcuj7ucxw61o.cloudfront.net/shani_demo.jpg'
                    alt='Financial Therapy Video 2'
                    fill
                    className='object-cover rounded-lg'
                  />
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Play className='w-8 h-8 text-white bg-black/50 rounded-full p-2' />
                  </div>
                </div>
                <button className='text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1'>
                  View All
                  <ArrowRight className='h-3 w-3 md:h-4 md:w-4' />
                </button>
              </div>
            </div>
          </div>
        </div>
        <ComingSoon />
      </main>
    </div>
  );
}
