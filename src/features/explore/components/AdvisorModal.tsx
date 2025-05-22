'use client';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useState } from 'react';

import { cn } from '@/src/lib/utils';
import { Advisor } from '@/src/shared/types';
import { COLORS } from '@/src/styles/colors';

import { advisorSignal, isOpenSignal } from './state/advisorSignals';
import { useMarketplaceIntegration } from './utils/useMarketplaceIntegration';

const AdvisorImage = ({ advisor }: { advisor: Advisor }) => {
  const { user } = useUser();
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const { isConnected, isChecking, bookingMode } = useMarketplaceIntegration(advisor);

  const handleBookSession = () => {
    // Track booking event with enhanced context
    posthog.capture('therapist_session_booked', {
      therapist_id: advisor.therapistId || advisor.id,
      therapist_name: advisor.name,
      booking_mode: bookingMode,
      has_google_calendar: isConnected,
      is_pending: advisor.isPending,
    });
    posthog.identify(user?.id, {
      current_therapist: advisor.name,
    });

    // Handle pending therapists - always use external booking
    if (advisor.isPending) {
      if (advisor.bookingURL) {
        window.open(advisor.bookingURL, '_blank');
      } else {
        console.error('No booking URL available for pending therapist');
      }
      return;
    }

    // Navigate based on the therapist's integration status for active therapists
    if (isConnected && advisor.therapistId) {
      // Use therapist ID for internal booking
      router.push(`/book/${advisor.therapistId}`);
    } else if (advisor.bookingURL) {
      // Use external booking URL
      window.open(advisor.bookingURL, '_blank');
    } else {
      console.error('No booking method available for this therapist');
    }
  };

  const getBookingButtonText = () => {
    if (isChecking) return 'Loading...';
    if (advisor.isPending) return 'Book via External Calendar';
    if (isConnected) return 'Book a Session';
    return 'Book via External Calendar';
  };

  return (
    <div className='md:w-1/3'>
      <div className='aspect-[3/4] w-full relative rounded-xl overflow-hidden'>
        <Image
          width={350}
          height={350}
          src={hasError ? '/experts/placeholderexp.png' : advisor.profileUrl || ''}
          alt={advisor.name}
          className={cn('h-full w-full object-cover', 'transition-opacity duration-300')}
          placeholder='blur'
          blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          priority
          onError={() => setHasError(true)}
          onClick={() => {
            // Track profile view event
            posthog.capture('therapist_profile_viewed', {
              therapist_id: advisor.therapistId || advisor.id,
              therapist_name: advisor.name,
              therapist_title: advisor.title,
              therapist_expertise: advisor.expertise,
            });
          }}
        />
      </div>
      <div className='mt-6 space-y-4'>
        <button
          onClick={handleBookSession}
          disabled={isChecking}
          className={cn(
            'block w-full py-3 px-4 text-center text-white rounded-lg transition-colors font-medium',
            isChecking
              ? 'bg-gray-400 cursor-not-allowed'
              : cn(COLORS.WARM_PURPLE.bg, COLORS.WARM_PURPLE.hover),
          )}
        >
          {getBookingButtonText()}
        </button>

        {/* Integration status indicator */}
        <div className='text-center text-xs text-gray-500'>
          {advisor.isPending ? (
            <span className='text-blue-600'>⏳ Pending therapist - External booking</span>
          ) : isConnected ? (
            <span className='text-green-600'>✓ Direct booking available</span>
          ) : (
            <span className='text-orange-600'>External calendar booking</span>
          )}
        </div>

        <div className='p-4 bg-gray-50 rounded-lg'>
          <h4 className='font-medium mb-2'>Certifications</h4>
          <p className='text-sm text-gray-600'>{advisor.certifications || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
};

const AdvisorDetails = ({ advisor }: { advisor: Advisor }) => (
  <div className='md:w-2/3'>
    <div className='mb-6'>
      <h2 className='text-2xl font-bold text-gray-900'>{advisor.name}</h2>
      <p className='text-lg text-gray-600'>{advisor.title}</p>
      <p className='mt-1 text-sm text-gray-500'>{advisor.yoe} years of experience</p>
    </div>

    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold mb-2'>Areas of Expertise</h3>
        <div className='flex flex-wrap gap-2'>
          {advisor.expertise?.split(',').map((exp: string, index: number) => (
            <span
              key={index}
              className={cn(
                'px-3 py-1 rounded-full text-sm',
                COLORS.WARM_PURPLE['10'],
                'text-purple-700',
              )}
            >
              {exp.trim()}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className='text-lg font-semibold mb-2'>Who I Work With</h3>
        <p className='text-gray-700'>{advisor.clientele}</p>
      </div>

      {advisor.longBio && (
        <div>
          <h3 className='text-lg font-semibold mb-2'>About Me</h3>
          <p className='text-gray-700'>{advisor.longBio}</p>
        </div>
      )}
    </div>
  </div>
);

const AdvisorModal = () => {
  const advisor = advisorSignal.value;
  const isOpen = isOpenSignal.value;

  if (!isOpen || !advisor) {
    return null;
  }

  const handleClose = () => {
    isOpenSignal.value = false;
    advisorSignal.value = null;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close modal if clicking on the overlay (outside the modal content)
    const modalContent = e.currentTarget.firstElementChild?.firstElementChild;
    if (modalContent && !modalContent.contains(e.target as Node)) {
      handleClose();
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50'
      onClick={handleOverlayClick}
    >
      <div className='min-h-screen px-4 text-center'>
        <div
          className='inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white rounded-2xl shadow-xl'
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <div className='relative p-6 sm:p-8'>
            <button
              onClick={handleClose}
              className='absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200 z-10'
            >
              <X className='h-5 w-5' />
            </button>

            <div className='flex flex-col md:flex-row gap-6 md:gap-8 mt-6'>
              <AdvisorImage advisor={advisor} />
              <AdvisorDetails advisor={advisor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorModal;
