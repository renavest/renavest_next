import { signal, computed } from '@preact-signals/safe-react';

import { Advisor, AdvisorState, BookingState, AdvisorImageStates } from '../types';

/**
 * Core advisor modal state
 */
export const advisorSignal = signal<Advisor | null>(null);
export const isOpenSignal = signal<boolean>(false);

/**
 * Advisors list state - reduces prop drilling and provides centralized data management
 */
export const advisorsListSignal = signal<Advisor[]>([]);
export const advisorsLoadingSignal = signal<boolean>(false);
export const advisorsErrorSignal = signal<string | null>(null);

/**
 * Image loading state for individual advisors
 * Tracks loading and error states per advisor ID to prevent flickering
 */
export const advisorImageLoadingSignal = signal<Record<string, boolean>>({});
export const advisorImageErrorSignal = signal<Record<string, boolean>>({});

/**
 * Enhanced marketplace integration state
 */
export const selectedAdvisorIdSignal = signal<string | null>(null);
export const isGoogleCalendarConnectedSignal = signal<boolean | null>(null);
export const isCheckingIntegrationSignal = signal<boolean>(false);
export const marketplaceErrorSignal = signal<string | null>(null);

/**
 * Booking flow state management
 */
export const isBookingFlowActiveSignal = signal<boolean>(false);
export const bookingModeSignal = signal<'internal' | 'external' | null>(null);

/**
 * Computed signals for derived state
 * These automatically update when their dependencies change
 */
export const hasAdvisorsSignal = computed(() => advisorsListSignal.value.length > 0);

export const activeAdvisorsSignal = computed(() =>
  advisorsListSignal.value.filter((advisor) => !advisor.isPending),
);

export const pendingAdvisorsSignal = computed(() =>
  advisorsListSignal.value.filter((advisor) => advisor.isPending),
);

export const advisorCountsSignal = computed(() => ({
  total: advisorsListSignal.value.length,
  active: activeAdvisorsSignal.value.length,
  pending: pendingAdvisorsSignal.value.length,
}));

/**
 * Actions to manage advisor state
 * Centralized state mutations for better maintainability
 */
export const advisorActions = {
  /**
   * Set the full list of advisors
   */
  setAdvisors: (advisors: Advisor[]) => {
    advisorsListSignal.value = advisors;
  },

  /**
   * Set loading state for advisor list
   */
  setLoading: (loading: boolean) => {
    advisorsLoadingSignal.value = loading;
  },

  /**
   * Set error state for advisor operations
   */
  setError: (error: string | null) => {
    advisorsErrorSignal.value = error;
  },

  /**
   * Open advisor detail modal
   */
  openAdvisorModal: (advisor: Advisor) => {
    advisorSignal.value = advisor;
    isOpenSignal.value = true;
  },

  /**
   * Close advisor detail modal
   */
  closeAdvisorModal: () => {
    advisorSignal.value = null;
    isOpenSignal.value = false;
  },

  /**
   * Set image loading state for specific advisor
   */
  setImageLoading: (advisorId: string, loading: boolean) => {
    advisorImageLoadingSignal.value = {
      ...advisorImageLoadingSignal.value,
      [advisorId]: loading,
    };
  },

  /**
   * Set image error state for specific advisor
   */
  setImageError: (advisorId: string, hasError: boolean) => {
    advisorImageErrorSignal.value = {
      ...advisorImageErrorSignal.value,
      [advisorId]: hasError,
    };
  },

  /**
   * Reset all state to initial values
   */
  resetState: () => {
    advisorSignal.value = null;
    isOpenSignal.value = false;
    advisorsListSignal.value = [];
    advisorsLoadingSignal.value = false;
    advisorsErrorSignal.value = null;
    advisorImageLoadingSignal.value = {};
    advisorImageErrorSignal.value = {};
    selectedAdvisorIdSignal.value = null;
    isGoogleCalendarConnectedSignal.value = null;
    isCheckingIntegrationSignal.value = false;
    marketplaceErrorSignal.value = null;
    isBookingFlowActiveSignal.value = false;
    bookingModeSignal.value = null;
  },
}; 