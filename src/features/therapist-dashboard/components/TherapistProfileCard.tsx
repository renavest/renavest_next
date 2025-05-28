'use client';
import { Loader2, X } from 'lucide-react';
import { useEffect } from 'react';

import { useGoogleCalendarIntegration } from '@/src/features/google-calendar/utils/googleCalendarIntegration';
import { therapistIdSignal } from '@/src/features/therapist-dashboard/state/therapistDashboardState';

import {
  profileSignal,
  profileLoadingSignal,
  profileErrorSignal,
  isCalendarConnectedSignal,
  profileActions,
  hasProfileSignal,
} from '../state/profileState';

import { ProfileDisplay } from './ProfileDisplay';
import { ProfileEditModal } from './ProfileEditModal';

export default function TherapistProfileCard() {
  const profile = profileSignal.value;
  const loading = profileLoadingSignal.value;
  const error = profileErrorSignal.value;
  const hasProfile = hasProfileSignal.value;

  // Check Google Calendar integration status
  const { status: calendarStatus } = useGoogleCalendarIntegration(therapistIdSignal.value || 0);

  useEffect(() => {
    // Update calendar connection status
    isCalendarConnectedSignal.value = !!calendarStatus.isConnected;
  }, [calendarStatus.isConnected]);

  useEffect(() => {
    // Load profile on component mount
    profileActions.loadProfile();
  }, []);

  const handlePhotoUpdated = (newPhotoUrl: string) => {
    profileActions.updatePhotoUrl(newPhotoUrl);
  };

  const openEditModal = () => {
    profileActions.openModal();
  };

  if (loading) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-10 min-h-[500px]'>
        <Loader2 className='animate-spin h-10 w-10 text-purple-600 mb-4' />
        <p className='text-purple-700 text-lg'>Loading profile...</p>
      </div>
    );
  }

  if (error && !hasProfile) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-10 min-h-[500px]'>
        <X className='h-10 w-10 text-red-500 mb-4' />
        <p className='text-red-600 text-lg'>{error}</p>
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
      <ProfileDisplay
        profile={displayProfile}
        onEditClick={openEditModal}
        onPhotoUpdated={handlePhotoUpdated}
      />

      <ProfileEditModal />
    </div>
  );
}
