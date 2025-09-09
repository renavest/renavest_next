'use client';

import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { firstNameSignal } from '@/src/features/utm/utmCustomDemo';
import { trackReferralShare } from '@/src/lib/referralTracking';
import { COLORS } from '@/src/styles/colors';

// import OnboardingModal from '../../onboarding/components/OnboardingModal';
// import { onboardingSignal } from '../../onboarding/state/onboardingState';

import ComingSoon from '../sections/ComingSoon';
import ConsultationBanner from '../sections/ConsultationBanner';
import { DashboardContent } from './DashboardContent';
import EmployeeNavbar from './EmployeeNavbar';
import FinancialTherapyModal from '../modals/FinancialTherapyModal';
import { ClientFormsDashboard } from '../forms/ClientFormsDashboard';

// const showOnboardingSignal = computed(() => {
//   return (
//     !onboardingSignal.value.isComplete &&
//     (typeof window !== 'undefined' ? window.location.pathname !== '/explore' : false)
//   );
// });

export default function LimitedDashboardClient() {
  const { user } = useUser();
  const [referralLink, setReferralLink] = useState('');
  const [isFinancialTherapyModalOpen, setIsFinancialTherapyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forms'>('dashboard');
  useEffect(() => {
    if (user && user.id) {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}?ref=${user.id}`;
      setReferralLink(link);

      posthog.identify(user.id, {
        email: user?.emailAddresses[0]?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
      });

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
    trackReferralShare(user?.id, 'copy_link', referralLink);
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

        {/* Take Quiz Banner (Replaces Weekly Money Belief) */}
        {/* <ConsultationBanner onTakeQuizClick={handleTakeQuizClick} /> */}

        {/* Tab Navigation */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-8'>
          <div className='flex'>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'forms'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Forms
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' ? (
          <DashboardContent
            onShareClick={handleShareClick}
            referralLink={referralLink}
            setIsFinancialTherapyModalOpen={setIsFinancialTherapyModalOpen}
          />
        ) : (
          <ClientFormsDashboard />
        )}
      </main>
      {/* {showOnboardingSignal.value && <OnboardingModal />} */}

    </div>
  );
}
