import { signal, computed } from '@preact-signals/safe-react';

import { TherapistProfile, ProfileFormData } from '../types/profile';

// Profile state signals
export const profileSignal = signal<TherapistProfile | null>(null);
export const profileLoadingSignal = signal<boolean>(false);
export const profileSavingSignal = signal<boolean>(false);
export const profileSaveSuccessSignal = signal<boolean>(false);
export const profileErrorSignal = signal<string | null>(null);
export const profileModalOpenSignal = signal<boolean>(false);
export const profileFormSignal = signal<ProfileFormData>({});

// Computed signals for derived state
export const hasProfileSignal = computed(() => profileSignal.value !== null);
export const isCalendarConnectedSignal = signal<boolean>(false);

// Profile actions
export const profileActions = {
  openModal: () => {
    if (profileSignal.value) {
      // Convert hourlyRateCents to dollars for form display
      const formData: ProfileFormData = {
        ...profileSignal.value.user,
        ...profileSignal.value.therapist,
        hourlyRate: profileSignal.value.therapist.hourlyRateCents
          ? (profileSignal.value.therapist.hourlyRateCents / 100).toFixed(2)
          : '',
      };
      profileFormSignal.value = formData;
    }
    profileModalOpenSignal.value = true;
  },

  closeModal: () => {
    profileModalOpenSignal.value = false;
    if (profileSignal.value) {
      // Reset form to current profile data
      const formData: ProfileFormData = {
        ...profileSignal.value.user,
        ...profileSignal.value.therapist,
        hourlyRate: profileSignal.value.therapist.hourlyRateCents
          ? (profileSignal.value.therapist.hourlyRateCents / 100).toFixed(2)
          : '',
      };
      profileFormSignal.value = formData;
    }
  },

  updateFormField: (field: keyof ProfileFormData, value: string | number) => {
    profileFormSignal.value = { ...profileFormSignal.value, [field]: value };
  },

  setProfile: (profile: TherapistProfile) => {
    profileSignal.value = profile;
    // Initialize form with profile data
    const formData: ProfileFormData = {
      ...profile.user,
      ...profile.therapist,
      hourlyRate: profile.therapist.hourlyRateCents
        ? (profile.therapist.hourlyRateCents / 100).toFixed(2)
        : '',
    };
    profileFormSignal.value = formData;
  },

  setLoading: (loading: boolean) => {
    profileLoadingSignal.value = loading;
  },

  setSaving: (saving: boolean) => {
    profileSavingSignal.value = saving;
  },

  setSaveSuccess: (success: boolean) => {
    profileSaveSuccessSignal.value = success;
    if (success) {
      setTimeout(() => {
        profileSaveSuccessSignal.value = false;
      }, 2000);
    }
  },

  setError: (error: string | null) => {
    profileErrorSignal.value = error;
  },

  updatePhotoUrl: (newPhotoUrl: string) => {
    profileFormSignal.value = { ...profileFormSignal.value, profileUrl: newPhotoUrl };
    // Update the profile state immediately to reflect the change
    if (profileSignal.value) {
      profileSignal.value = {
        ...profileSignal.value,
        therapist: {
          ...profileSignal.value.therapist,
          profileUrl: newPhotoUrl,
        },
      };
    }
  },

  loadProfile: async () => {
    profileActions.setLoading(true);
    profileActions.setError(null);

    try {
      const res = await fetch('/api/therapist/profile');
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      profileActions.setProfile(data);
    } catch (err) {
      profileActions.setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      profileActions.setLoading(false);
    }
  },

  saveProfile: async () => {
    profileActions.setSaving(true);
    profileActions.setSaveSuccess(false);
    profileActions.setError(null);

    try {
      // Convert hourlyRate from dollars to cents for API
      const formDataForAPI = { ...profileFormSignal.value };
      if (profileFormSignal.value.hourlyRate) {
        formDataForAPI.hourlyRateCents = Math.round(
          parseFloat(profileFormSignal.value.hourlyRate) * 100,
        );
        delete formDataForAPI.hourlyRate; // Remove the dollar version
      }

      const res = await fetch('/api/therapist/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataForAPI),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      // Update the profile state with the returned data
      profileActions.setProfile(data);
      profileActions.closeModal();
      profileActions.setSaveSuccess(true);

      // Force a fresh fetch of profile data to ensure everything is in sync
      setTimeout(() => {
        profileActions.loadProfile();
      }, 500);
    } catch (err) {
      profileActions.setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      profileActions.setSaving(false);
    }
  },
};
