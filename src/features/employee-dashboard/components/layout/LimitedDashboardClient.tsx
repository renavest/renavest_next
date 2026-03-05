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
import { QuizModal } from '../modals/QuizModal';
import EmployeeExploreContent from '../explore/EmployeeExploreContent';


import TherapistCard from '../therapistCatalog/TherapistCard';
import TherapistModal from '../therapistCatalog/TherapistModal';
import therapistsData from '../therapistCatalog/financial_therapists.json';

interface Therapist {
  id: number;
  name: string;
  title: string;
  expertise: string;
  certifications: string | null;
  song: string | null;
  yoe: number;
  clientele: string;
  longbio: string;
  bookingurl: string;
  demourl: string;
  previewblurb: string | null;
  profileurl: string | null;
}

// const showOnboardingSignal = computed(() => {
//   return (
//     !onboardingSignal.value.isComplete &&
//     (typeof window !== 'undefined' ? window.location.pathname !== '/employee' : false)
//   );
// });

export default function LimitedDashboardClient() {
  const { user } = useUser();
  const [referralLink, setReferralLink] = useState('');
  const [isFinancialTherapyModalOpen, setIsFinancialTherapyModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forms' | 'explore'>('explore');
  const [remainingFreeSessions, setRemainingFreeSessions] = useState<number | null>(null);
  
  // Function to fetch remaining free sessions
  const fetchRemainingFreeSessions = () => {
    fetch('/api/employee/free-sessions')
      .then((res) => res.json())
      .then((data) => {
        if (data.remainingFreeSessions !== undefined) {
          setRemainingFreeSessions(data.remainingFreeSessions);
        }
      })
      .catch((error) => {
        console.error('Error fetching free sessions:', error);
      });
  };

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

      // Fetch remaining free sessions on initial load
      fetchRemainingFreeSessions();
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

  const handleTakeQuizClick = () => {
    // Track quiz start event
    posthog.capture('quiz_started', {
      userId: user?.id,
      userEmail: user?.emailAddresses[0]?.emailAddress,
    });

    setIsQuizModalOpen(true);
  };

  const handleQuizComplete = () => {
    setHasCompletedQuiz(true);
    // Track quiz completion
    posthog.capture('quiz_completed_dashboard', {
      userId: user?.id,
      userEmail: user?.emailAddresses[0]?.emailAddress,
    });
  };

  const therapists = therapistsData as Therapist[];
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTherapistClick = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setIsModalOpen(true);
    // Refresh free sessions count when modal opens
    fetchRemainingFreeSessions();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTherapist(null);
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
        {/* Welcome Header */}
        <div className='mb-10 md:mb-14'>
          <div className='relative overflow-hidden rounded-3xl p-8 md:p-12 shadow-xl' style={{ background: 'linear-gradient(135deg, #9071FF 0%, #7c5ce7 50%, #6c3ce0 100%)' }}>
            <div className='absolute top-0 right-0 w-72 h-72 bg-white rounded-full opacity-5' style={{ transform: 'translate(33%, -50%)' }}></div>
            <div className='absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full opacity-5' style={{ transform: 'translate(-25%, 50%)' }}></div>
            <div className='absolute w-32 h-32 bg-white rounded-full opacity-5' style={{ top: '50%', right: '25%' }}></div>
            <div className='relative' style={{ zIndex: 10 }}>
              <div className='max-w-3xl mx-auto text-center'>
                <h2 className='text-3xl md:text-5xl font-bold text-white mb-4' style={{ letterSpacing: '-0.02em', lineHeight: '1.15' }}>
                  {firstNameSignal.value
                    ? `Welcome, ${firstNameSignal.value}`
                    : user?.firstName
                      ? `Welcome, ${user?.firstName}`
                      : 'Welcome'}
                  <span className='inline-block ml-2 animate-wave'>{'👋'}</span>
                </h2>
                <p className='text-lg md:text-xl leading-relaxed mb-6 max-w-2xl mx-auto' style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Money can be overwhelming, but you are not alone. Renavest is a judgment-free space to talk with financial therapists and build a plan that works for you.
                </p>
                <p className='text-lg md:text-xl leading-relaxed mb-6 max-w-2xl mx-auto' style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Whether you are feeling stuck, stressed, or ready to grow, you are in the right place.
                </p>
                <p className='text-base md:text-lg' style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Browse and choose the financial therapist right for you
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className='text-center mt-10 md:mt-14 mb-2'>
          <h3 className='text-2xl md:text-4xl font-bold text-gray-900 mb-3' style={{ letterSpacing: '-0.01em' }}>
            Ease Your Money Stress With Financial Therapy.
          </h3>
          <p className='text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed'>
            80% of Americans feel financial anxiety. You are not alone! Take a breath. A Financial Therapist is here to help.
          </p>
        </div>

      {/* Therapists Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {therapists.map((therapist) => (
            <TherapistCard
              key={therapist.id}
              name={therapist.name}
              title={therapist.title}
              expertise={therapist.expertise}
              previewblurb={therapist.previewblurb}
              profileurl={therapist.profileurl}
              onClick={() => handleTherapistClick(therapist)}
            />
          ))}
        </div>
      </section>

      {/* Modal */}
      <TherapistModal
        therapist={selectedTherapist}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBookSessionClick={fetchRemainingFreeSessions}
      />      


        {/* Take Quiz Banner (Replaces Weekly Money Belief) */}
        {/* <ConsultationBanner onTakeQuizClick={handleTakeQuizClick} /> */}

        {/* Tab Navigation */}
        {/* <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-8'>
          <div className='flex'>
          <button
              onClick={() => setActiveTab('explore')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'explore'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Therapists
            </button>            
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
        </div> */}

        {/* Tab Content */}
        {/* {activeTab === 'dashboard' ? (
          <DashboardContent
            hasCompletedQuiz={hasCompletedQuiz}
            onTakeQuizClick={handleTakeQuizClick}
            onShareClick={handleShareClick}
            referralLink={referralLink}
            setIsFinancialTherapyModalOpen={setIsFinancialTherapyModalOpen}
          />
        ) : activeTab === 'forms' ? (
          <ClientFormsDashboard />
        ) : (
          <EmployeeExploreContent />
        )}
        {isQuizModalOpen ? (
          <div className='flex justify-center mt-8'>
            <button
              onClick={() => setActiveTab('explore')}
              className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-md font-semibold transition-colors duration-300'
            >
              View More Therapists
            </button>
          </div>
        ) : (
          <ComingSoon />
        )} */}
      </main>
      {/* {showOnboardingSignal.value && <OnboardingModal />} */}

      {/* Render modals */}
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}
