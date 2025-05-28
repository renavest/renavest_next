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
      const updatedProfile = {
        ...profileSignal.value,
        therapist: {
          ...profileSignal.value.therapist,
          profileUrl: newPhotoUrl,
          updatedAt: new Date().toISOString(), // Update timestamp to help with cache busting
        },
      };
      profileSignal.value = updatedProfile;

      // Also update the form with the new timestamp
      const formData: ProfileFormData = {
        ...updatedProfile.user,
        ...updatedProfile.therapist,
        hourlyRate: updatedProfile.therapist.hourlyRateCents
          ? (updatedProfile.therapist.hourlyRateCents / 100).toFixed(2)
          : '',
      };
      profileFormSignal.value = formData;
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
    profileActions.setError(null);
    profileActions.setSaveSuccess(false);

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

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Save isn't working right now. Please try again later.");
      }

      if (!res.ok) {
        // Provide user-friendly error messages
        if (res.status === 401) {
          throw new Error('Please refresh the page and try again.');
        }
        if (res.status >= 500) {
          throw new Error("Save isn't working right now. Please try again later.");
        }

        const errorMsg = data.error || 'Failed to save profile. Please try again.';

        // Make technical errors more user-friendly
        if (errorMsg.includes('database') || errorMsg.includes('DB')) {
          throw new Error("Save isn't working right now. Please try again later.");
        }

        throw new Error(errorMsg);
      }

      profileActions.setProfile(data);
      profileActions.setSaveSuccess(true);
      profileActions.closeModal();

      // Force a complete profile reload to get the latest data with updated timestamps
      setTimeout(async () => {
        await profileActions.loadProfile();
      }, 200);

      // Clear success message after 3 seconds
      setTimeout(() => {
        profileActions.setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Save isn't working right now. Please try again later.";
      profileActions.setError(errorMsg);
    } finally {
      profileActions.setSaving(false);
    }
  },
};
