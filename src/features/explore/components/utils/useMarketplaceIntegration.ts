import { useEffect } from 'react';

import { Advisor } from '@/src/shared/types';

import {
  isGoogleCalendarConnectedSignal,
  isCheckingIntegrationSignal,
  marketplaceErrorSignal,
  bookingModeSignal,
} from '../state/advisorSignals';

/**
 * Hook to manage marketplace integration status using signals
 * This replaces the old useGoogleCalendarIntegration hook with better state management
 */
export function useMarketplaceIntegration(advisor: Advisor | null) {
  useEffect(() => {
    if (!advisor) {
      isGoogleCalendarConnectedSignal.value = null;
      bookingModeSignal.value = null;
      marketplaceErrorSignal.value = null;
      return;
    }

    isCheckingIntegrationSignal.value = true;
    marketplaceErrorSignal.value = null;

    try {
      // Use the enhanced advisor data to determine integration status
      const hasGoogleCalendar = advisor.hasGoogleCalendar || false;
      const isConnected = advisor.googleCalendarStatus === 'connected';

      isGoogleCalendarConnectedSignal.value = hasGoogleCalendar && isConnected;
      bookingModeSignal.value = hasGoogleCalendar && isConnected ? 'internal' : 'external';
    } catch (error) {
      console.error('Error checking marketplace integration:', error);
      marketplaceErrorSignal.value = 'Failed to check integration status';
      isGoogleCalendarConnectedSignal.value = false;
      bookingModeSignal.value = 'external';
    } finally {
      isCheckingIntegrationSignal.value = false;
    }
  }, [advisor]);

  return {
    isConnected: isGoogleCalendarConnectedSignal.value,
    isChecking: isCheckingIntegrationSignal.value,
    error: marketplaceErrorSignal.value,
    bookingMode: bookingModeSignal.value,
  };
}
