'use client';
import { useUser } from '@clerk/nextjs';
import { Loader2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useGoogleCalendarIntegration } from '@/src/features/google-calendar/utils/googleCalendarIntegration';
import { trackTherapistDashboard } from '@/src/features/posthog/therapistTracking';
import {
  therapistIdSignal,
  initializeTherapistId,
  getValidTherapistId,
  therapistIdLoadingSignal,
  therapistIdErrorSignal,
} from '@/src/features/therapist-dashboard/state/therapistDashboardState';

import {
  profileSignal,
  profileLoadingSignal,
  profileErrorSignal,
  isCalendarConnectedSignal,
  profileActions,
  hasProfileSignal,
} from '../../state/profileState';

import { ProfileDisplay } from './ProfileDisplay';
import { ProfileEditModal } from './ProfileEditModal';

export default function TherapistProfileCard() {
  const { user } = useUser();
  const profile = profileSignal.value;
  const loading = profileLoadingSignal.value;
  const error = profileErrorSignal.value;
  const hasProfile = hasProfileSignal.value;
  const therapistIdLoading = therapistIdLoadingSignal.value;
  const therapistIdError = therapistIdErrorSignal.value;

  // Track if we've attempted initialization for this user
  const initializationAttemptedRef = useRef<string | null>(null);

  // Initialize therapist ID with robust error handling
  useEffect(() => {
    async function initializeTherapistIdSafely() {
      if (!user?.id) {
        console.log('No user ID available for therapist initialization');
        return;
      }

      // Prevent multiple initialization attempts for the same user
      if (initializationAttemptedRef.current === user.id) {
        console.log('Initialization already attempted for this user');
        return;
      }

      const currentTherapistId = getValidTherapistId();
      if (currentTherapistId) {
        console.log('Valid therapist ID already exists:', currentTherapistId);
        initializationAttemptedRef.current = user.id;
        return;
      }

      if (therapistIdLoading) {
        console.log('Therapist ID initialization already in progress');
        return;
      }

      console.log('Starting therapist ID initialization for user:', user.id);
      initializationAttemptedRef.current = user.id;

      try {
        const therapistId = await initializeTherapistId(user.id);
        if (therapistId) {
          console.log('Therapist ID initialization successful:', therapistId);
        } else {
          console.error('Therapist ID initialization failed');
          // Reset the attempted flag on failure so retry is possible
          initializationAttemptedRef.current = null;
        }
      } catch (error) {
        console.error('Error during therapist ID initialization:', error);
        // Reset the attempted flag on error so retry is possible
        initializationAttemptedRef.current = null;
      }
    }

    initializeTherapistIdSafely();
  }, [user?.id]); // Removed therapistIdLoading from dependencies to prevent loop

  // Check Google Calendar integration status - only after therapistId is set
  const validTherapistId = getValidTherapistId();
  const { status: calendarStatus } = useGoogleCalendarIntegration(validTherapistId || 0);

  useEffect(() => {
    // Update calendar connection status
    isCalendarConnectedSignal.value = !!calendarStatus.isConnected;
  }, [calendarStatus.isConnected]);

  // Track profile loading to prevent loops
  const profileLoadedRef = useRef(false);

  useEffect(() => {
    // Load profile on component mount - only after therapistId is initialized
    const currentTherapistId = getValidTherapistId();
    if (currentTherapistId && !loading && !profileLoadedRef.current) {
      console.log('Loading profile for therapist ID:', currentTherapistId);
      profileLoadedRef.current = true;
      profileActions.loadProfile();

      // Track profile page view
      trackTherapistDashboard.profileViewed(currentTherapistId, {
        user_id: `therapist_${currentTherapistId}`,
      });
    }
  }, [therapistIdSignal.value, loading]);

  const openEditModal = () => {
    // Track profile edit attempt
    const currentTherapistId = getValidTherapistId();
    if (currentTherapistId) {
      trackTherapistDashboard.profileEditAttempted(currentTherapistId, {
        user_id: `therapist_${currentTherapistId}`,
      });
    }
    profileActions.openModal();
  };

  // Show loading if either therapist ID or profile is loading
  if (loading || therapistIdLoading) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-10 min-h-[500px]'>
        <Loader2 className='animate-spin h-10 w-10 text-purple-600 mb-4' />
        <p className='text-purple-700 text-lg'>
          {therapistIdLoading ? 'Initializing account...' : 'Loading profile...'}
        </p>
      </div>
    );
  }

  // Show therapist ID error if initialization failed
  if (therapistIdError) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-10 min-h-[500px]'>
        <X className='h-10 w-10 text-red-500 mb-4' />
        <p className='text-red-600 text-lg'>Account Setup Error</p>
        <p className='text-red-500 text-sm mt-2 text-center max-w-md'>{therapistIdError}</p>
        <button
          onClick={() => {
            if (user?.id) {
              // Reset the attempted flag and try again
              initializationAttemptedRef.current = null;
              initializeTherapistId(user.id);
            }
          }}
          className='mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
        >
          Retry Setup
        </button>
      </div>
    );
  }

  // Show profile error if profile loading failed but therapist ID is OK
  if (error && !hasProfile && getValidTherapistId()) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-10 min-h-[500px]'>
        <X className='h-10 w-10 text-red-500 mb-4' />
        <p className='text-red-600 text-lg'>Profile Error</p>
        <p className='text-red-500 text-sm mt-2'>{error}</p>
        <button
          onClick={() => {
            profileLoadedRef.current = false;
            profileActions.loadProfile();
          }}
          className='mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
        >
          Retry Loading
        </button>
      </div>
    );
  }

  if (!profile) return null;

  // Hide booking URL if Google Calendar is connected
  const displayProfile = {
    ...profile,
    therapist: {
      ...profile.therapist,
      bookingURL: calendarStatus.isConnected ? undefined : profile.therapist.bookingURL,
    },
  };

  return (
    <div className='space-y-6'>
      <ProfileDisplay profile={displayProfile} onEditClick={openEditModal} />

      <ProfileEditModal />
    </div>
  );
}
