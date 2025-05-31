'use client';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useState, useEffect } from 'react';
import React from 'react';
import { toast } from 'sonner';

import { cn } from '@/src/lib/utils';
import { Advisor } from '@/src/shared/types';
import { COLORS } from '@/src/styles/colors';

import {
  advisorSignal,
  isOpenSignal,
  advisorActions,
  advisorImageLoadingSignal,
  advisorImageErrorSignal,
} from './state/advisorSignals';
import { useMarketplaceIntegration } from './utils/useMarketplaceIntegration';

const AdvisorImage = ({ advisor }: { advisor: Advisor }) => {
  const { user } = useUser();
  const router = useRouter();
  const [currentUserTherapistId, setCurrentUserTherapistId] = useState<number | null>(null);
  const { isConnected, isChecking, bookingMode } = useMarketplaceIntegration(advisor);

  // Initialize loading state immediately if not set
  React.useMemo(() => {
    if (advisorImageLoadingSignal.value[advisor.id] === undefined) {
      advisorActions.setImageLoading(advisor.id, true);
    }
  }, [advisor.id]);

  // Use global signals with proper fallbacks
  const isLoading = advisorImageLoadingSignal.value[advisor.id] !== false;
  const hasError = advisorImageErrorSignal.value[advisor.id] || false;

  // Check if current user is a therapist and get their therapist ID
  useEffect(() => {
    const fetchCurrentUserTherapistId = async () => {
      if (user?.publicMetadata?.role === 'therapist') {
        try {
          const response = await fetch('/api/therapist/id');
          const data = await response.json();
          if (data.therapistId) {
            setCurrentUserTherapistId(data.therapistId);
          }
        } catch (error) {
          console.error('Failed to fetch current user therapist ID:', error);
        }
      }
    };
    fetchCurrentUserTherapistId();
  }, [user]);

  // Check if user is trying to book themselves
  const isBookingSelf = !!(
    currentUserTherapistId && advisor.therapistId === currentUserTherapistId
  );

  const handleImageLoad = () => {
    advisorActions.setImageLoading(advisor.id, false);
    advisorActions.setImageError(advisor.id, false);
  };

  const handleImageError = () => {
    advisorActions.setImageLoading(advisor.id, false);
    advisorActions.setImageError(advisor.id, true);
  };

  const handleBookSession = async () => {
    // Prevent self-booking
    if (isBookingSelf) {
      alert('You cannot book a session with yourself!');
      return;
    }

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
      // Send notification email for pending therapists
      await sendBookingNotification(advisor.id, 'Pending Therapist');

      if (advisor.bookingURL) {
        window.open(advisor.bookingURL, '_blank');
      } else {
        console.error('No booking URL available for pending therapist');
      }
      return;
    }

    // Navigate based on the therapist's integration status for active therapists
    if (isConnected && advisor.therapistId) {
      // TODO: Re-enable billing check once Stripe integration is fully complete
      // // For direct booking, check billing information first
      // try {
      //   const billingResponse = await fetch('/api/stripe/billing-setup-check');

      //   if (billingResponse.ok) {
      //     const billingData = await billingResponse.json();

      //     if (!billingData.hasPaymentMethod) {
      //       // Redirect to billing setup with therapist ID
      //       toast.info('Please add a payment method to book sessions directly');
      //       router.push(
      //         `/billing/setup?therapistId=${advisor.therapistId}&redirect=/book/${advisor.therapistId}`,
      //       );
      //       return;
      //     }
      //   } else {
      //     console.warn('Could not check billing setup, proceeding with booking');
      //   }
      // } catch (error) {
      //   console.error('Error checking billing setup:', error);
      //   // Continue with booking if billing check fails
      // }

      // Use therapist ID for internal booking
      router.push(`/book/${advisor.therapistId}`);
    } else if (advisor.bookingURL) {
      // Send notification email for external booking
      await sendBookingNotification(
        advisor.therapistId?.toString() || advisor.id,
        'External Calendar',
      );

      // Use external booking URL
      window.open(advisor.bookingURL, '_blank');
    } else {
      console.error('No booking method available for this therapist');
    }
  };

  const sendBookingNotification = async (therapistId: string, bookingType: string) => {
    try {
      // First get therapist details
      const therapistResponse = await fetch(`/api/therapist/details/${therapistId}`);
      if (!therapistResponse.ok) {
        console.error('Failed to fetch therapist details');
        return;
      }

      const therapistData = await therapistResponse.json();

      // Send notification email using the unified API
      const notificationResponse = await fetch('/api/booking/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistName: therapistData.name,
          therapistEmail: therapistData.email,
          bookingType: bookingType,
        }),
      });

      if (notificationResponse.ok) {
        console.log('Booking notification sent successfully');
        toast.success(`${therapistData.name} has been notified of your booking interest!`);
      } else {
        const errorData = await notificationResponse.json();
        console.error('Failed to send booking notification:', errorData.error);
        toast.error('Unable to notify therapist. Please contact them directly.');
      }
    } catch (error) {
      console.error('Error sending booking notification:', error);
      toast.error('Unable to notify therapist. Please contact them directly.');
    }
  };

  const getBookingButtonText = () => {
    if (isBookingSelf) return 'Cannot Book Yourself';
    if (isChecking) return 'Loading...';
    if (advisor.isPending) return 'Book via External Calendar';
    if (isConnected) return 'Book a Session';
    return 'Book via External Calendar';
  };

  return (
    <div className='md:w-1/3'>
      <div className='aspect-[3/4] w-full relative rounded-xl overflow-hidden'>
        {isLoading && !hasError && (
          <div className='absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center z-10'>
            <div className='flex flex-col items-center space-y-2'>
              <div className='w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin'></div>
              <span className='text-sm text-gray-500 font-medium'>Loading...</span>
            </div>
          </div>
        )}
        <Image
          width={350}
          height={350}
          src={hasError ? '/experts/placeholderexp.png' : advisor.profileUrl || ''}
          alt={advisor.name}
          className={cn(
            'h-full w-full object-cover',
            'transition-opacity duration-500',
            isLoading ? 'opacity-0' : 'opacity-100',
            // Ensure no background shows through during loading
            'bg-gray-100',
          )}
          sizes='(max-width: 640px) 300px, (max-width: 768px) 350px, 400px'
          placeholder='blur'
          blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
          priority
          quality={85}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{
            // Prevent any default browser styling that might cause flashing
            backgroundColor: '#f3f4f6', // gray-100 fallback
          }}
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
          disabled={isChecking || isBookingSelf}
          className={cn(
            'block w-full py-3 px-4 text-center text-white rounded-lg transition-colors font-medium',
            isChecking || isBookingSelf
              ? 'bg-gray-400 cursor-not-allowed'
              : cn(COLORS.WARM_PURPLE.bg, COLORS.WARM_PURPLE.hover),
          )}
        >
          {getBookingButtonText()}
        </button>

        {/* Integration status indicator */}
        <div className='text-center text-xs text-gray-500'>
          {isBookingSelf ? (
            <span className='text-red-600'>⚠️ This is your own profile</span>
          ) : advisor.isPending ? (
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
    advisorActions.closeAdvisorModal();
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
