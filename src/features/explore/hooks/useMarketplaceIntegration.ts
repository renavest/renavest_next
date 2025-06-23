import { useEffect } from 'react';

import type { Advisor } from '@/src/shared/types';

import {
  isGoogleCalendarConnectedSignal,
  isCheckingIntegrationSignal,
  marketplaceErrorSignal,
  bookingModeSignal,
} from '../state/exploreState';
import type { MarketplaceIntegration } from '../types';

/**
 * Hook to manage marketplace integration status using signals
 *
 * This hook determines whether an advisor has integrated their Google Calendar
 * and sets the appropriate booking mode (internal vs external).
 *
 * @param advisor - The advisor to check integration status for
 * @returns MarketplaceIntegration object with connection status and booking mode
 */
export function useMarketplaceIntegration(advisor: Advisor | null): MarketplaceIntegration {
  useEffect(() => {
    if (!advisor) {
      // Reset state when no advisor is selected
      isGoogleCalendarConnectedSignal.value = null;
      bookingModeSignal.value = null;
      marketplaceErrorSignal.value = null;
      return;
    }

    // Set checking state
    isCheckingIntegrationSignal.value = true;
    marketplaceErrorSignal.value = null;

    try {
      // Determine integration status from advisor data
      const hasGoogleCalendar = advisor.hasGoogleCalendar || false;
      const isConnected = advisor.googleCalendarStatus === 'connected';
      const integrationComplete = hasGoogleCalendar && isConnected;

      // Update signals with integration status
      isGoogleCalendarConnectedSignal.value = integrationComplete;
      bookingModeSignal.value = integrationComplete ? 'internal' : 'external';

      // Log integration status for debugging
      console.log(`Advisor ${advisor.name} integration:`, {
        hasGoogleCalendar,
        status: advisor.googleCalendarStatus,
        mode: integrationComplete ? 'internal' : 'external',
      });
    } catch (error) {
      console.error('Error checking marketplace integration:', error);
      marketplaceErrorSignal.value = 'Failed to check integration status';
      isGoogleCalendarConnectedSignal.value = false;
      bookingModeSignal.value = 'external';
    } finally {
      // Always clear checking state
      isCheckingIntegrationSignal.value = false;
    }
  }, [advisor?.id, advisor?.hasGoogleCalendar, advisor?.googleCalendarStatus]);

  return {
    isConnected: isGoogleCalendarConnectedSignal.value,
    isChecking: isCheckingIntegrationSignal.value,
    error: marketplaceErrorSignal.value,
    bookingMode: bookingModeSignal.value,
  };
}
