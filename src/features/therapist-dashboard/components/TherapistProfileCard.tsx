'use client';
import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useGoogleCalendarIntegration } from '@/src/features/google-calendar/utils/googleCalendarIntegration';
import { therapistIdSignal } from '@/src/features/therapist-dashboard/state/therapistDashboardState';

import { ProfileDisplay } from './ProfileDisplay';
import { ProfileEditModal } from './ProfileEditModal';

interface TherapistProfile {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
    imageUrl?: string;
  };
  therapist: {
    name?: string;
    title?: string;
    bookingURL?: string;
    expertise?: string;
    certifications?: string;
    song?: string;
    yoe?: number;
    clientele?: string;
    longBio?: string;
    previewBlurb?: string;
    profileUrl?: string;
    hourlyRate?: string;
    hourlyRateCents?: number;
  };
}

interface FormData {
  name?: string;
  title?: string;
  email?: string;
  yoe?: number;
  hourlyRate?: string;
  hourlyRateCents?: number;
  expertise?: string;
  certifications?: string;
  clientele?: string;
  longBio?: string;
  bookingURL?: string;
  firstName?: string;
  lastName?: string;
  profileUrl?: string;
}

export default function TherapistProfileCard() {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormData>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check Google Calendar integration status
  const { status: calendarStatus } = useGoogleCalendarIntegration(therapistIdSignal.value || 0);
  const isCalendarConnected = !!calendarStatus.isConnected;

  useEffect(() => {
    setLoading(true);
    fetch('/api/therapist/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProfile(data);
        // Initialize form with existing profile data
        // Convert hourlyRateCents to dollars for display
        const formData = {
          ...data.user,
          ...data.therapist,
          hourlyRate: data.therapist.hourlyRateCents
            ? (data.therapist.hourlyRateCents / 100).toFixed(2)
            : '',
        };
        setForm(formData);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev: FormData) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoUploaded = (newPhotoUrl: string) => {
    setForm((prev: FormData) => ({ ...prev, profileUrl: newPhotoUrl }));
    // Update the profile state immediately to reflect the change
    if (profile) {
      setProfile({
        ...profile,
        therapist: {
          ...profile.therapist,
          profileUrl: newPhotoUrl,
        },
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      // Convert hourlyRate from dollars to cents for API
      const formDataForAPI = { ...form };
      if (form.hourlyRate) {
        formDataForAPI.hourlyRateCents = Math.round(parseFloat(form.hourlyRate) * 100);
        delete formDataForAPI.hourlyRate; // Remove the dollar version
      }

      console.log('Saving profile data:', formDataForAPI);

      const res = await fetch('/api/therapist/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataForAPI),
      });
      const data = await res.json();

      console.log('Save response:', data);

      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      // Update the profile state with the returned data
      setProfile(data);

      // Update the form state to match the saved data
      const updatedFormData = {
        ...data.user,
        ...data.therapist,
        hourlyRate: data.therapist.hourlyRateCents
          ? (data.therapist.hourlyRateCents / 100).toFixed(2)
          : '',
      };
      setForm(updatedFormData);

      setIsModalOpen(false);
      setSaveSuccess(true);

      console.log('Profile updated successfully');

      // Force a fresh fetch of profile data to ensure everything is in sync
      setTimeout(() => {
        fetch('/api/therapist/profile')
          .then((res) => res.json())
          .then((freshData) => {
            if (!freshData.error) {
              setProfile(freshData);
              console.log('Fresh profile data loaded:', freshData);
            }
          })
          .catch(console.error);
      }, 500);
    } catch (err: unknown) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const openEditModal = () => {
    if (profile) {
      // Convert hourlyRateCents to dollars for form display
      const formData = {
        ...profile.user,
        ...profile.therapist,
        hourlyRate: profile.therapist.hourlyRateCents
          ? (profile.therapist.hourlyRateCents / 100).toFixed(2)
          : '',
      };
      setForm(formData);
    }
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    if (profile) {
      // Convert hourlyRateCents to dollars for form display
      const formData = {
        ...profile.user,
        ...profile.therapist,
        hourlyRate: profile.therapist.hourlyRateCents
          ? (profile.therapist.hourlyRateCents / 100).toFixed(2)
          : '',
      };
      setForm(formData);
    }
  };

  if (loading) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-10 min-h-[500px]'>
        <Loader2 className='animate-spin h-10 w-10 text-purple-600 mb-4' />
        <p className='text-purple-700 text-lg'>Loading profile...</p>
      </div>
    );
  }

  if (error && !isModalOpen) {
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
      bookingURL: isCalendarConnected ? undefined : profile.therapist.bookingURL,
    },
  };

  return (
    <div className='space-y-6'>
      <ProfileDisplay
        profile={displayProfile}
        onEditClick={openEditModal}
        onPhotoUpdated={handlePhotoUploaded}
      />

      <ProfileEditModal
        isOpen={isModalOpen}
        onClose={closeEditModal}
        profile={profile}
        form={form}
        onFormChange={handleChange}
        onSave={handleSave}
        saving={saving}
        saveSuccess={saveSuccess}
        error={error}
        isCalendarConnected={isCalendarConnected}
        onPhotoUploaded={handlePhotoUploaded}
      />
    </div>
  );
}
