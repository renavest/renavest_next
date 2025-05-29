import { signal, computed } from '@preact-signals/safe-react';

import { Advisor } from '@/src/shared/types';

// Core advisor state
export const advisorSignal = signal<Advisor | null>(null);
export const isOpenSignal = signal<boolean>(false);

// Advisors list state - to reduce prop drilling
export const advisorsListSignal = signal<Advisor[]>([]);
export const advisorsLoadingSignal = signal<boolean>(false);
export const advisorsErrorSignal = signal<string | null>(null);

// Image loading state for individual advisors
export const advisorImageLoadingSignal = signal<Record<string, boolean>>({});
export const advisorImageErrorSignal = signal<Record<string, boolean>>({});

// Enhanced marketplace state
export const selectedAdvisorIdSignal = signal<string | null>(null);
export const isGoogleCalendarConnectedSignal = signal<boolean | null>(null);
export const isCheckingIntegrationSignal = signal<boolean>(false);
export const marketplaceErrorSignal = signal<string | null>(null);

// Booking flow state
export const isBookingFlowActiveSignal = signal<boolean>(false);
export const bookingModeSignal = signal<'internal' | 'external' | null>(null);

// Computed signals for derived state
export const hasAdvisorsSignal = computed(() => advisorsListSignal.value.length > 0);
export const activeAdvisorsSignal = computed(() =>
  advisorsListSignal.value.filter((advisor) => !advisor.isPending),
);
export const pendingAdvisorsSignal = computed(() =>
  advisorsListSignal.value.filter((advisor) => advisor.isPending),
);

// Actions to manage state
export const advisorActions = {
  setAdvisors: (advisors: Advisor[]) => {
    advisorsListSignal.value = advisors;
  },

  setLoading: (loading: boolean) => {
    advisorsLoadingSignal.value = loading;
  },

  setError: (error: string | null) => {
    advisorsErrorSignal.value = error;
  },

  openAdvisorModal: (advisor: Advisor) => {
    advisorSignal.value = advisor;
    isOpenSignal.value = true;
  },

  closeAdvisorModal: () => {
    advisorSignal.value = null;
    isOpenSignal.value = false;
  },

  setImageLoading: (advisorId: string, loading: boolean) => {
    advisorImageLoadingSignal.value = {
      ...advisorImageLoadingSignal.value,
      [advisorId]: loading,
    };
  },

  setImageError: (advisorId: string, hasError: boolean) => {
    advisorImageErrorSignal.value = {
      ...advisorImageErrorSignal.value,
      [advisorId]: hasError,
    };
  },
};
