import { signal } from '@preact-signals/safe-react';
import { DateTime } from 'luxon';
import { toast } from 'sonner';

import { TimeSlot } from '@/src/utils/timezone';

import { TimezoneIdentifier } from '../../utils/dateTimeUtils';
export const selectedSlotSignal = signal<TimeSlot | null>(null);
export const timezoneSignal = signal<TimezoneIdentifier>('America/New_York');
export const availableSlotsSignal = signal<Array<{ start: string; end: string }>>([]);
export const loadingSignal = signal(true);
export const errorSignal = signal<string | null>(null);
export const isGoogleCalendarIntegratedSignal = signal(false);
export const isCheckingIntegrationSignal = signal(true);

/**
 * Checks if a therapist has a valid Google Calendar integration
 * This function only verifies that integration exists, not that the tokens are valid
 */
export async function checkGoogleCalendarIntegration(therapistId: number) {
  isCheckingIntegrationSignal.value = true;
  try {
    console.log('Checking Google Calendar integration for therapist:', therapistId);
    const response = await fetch(`/api/google-calendar/status?therapistId=${therapistId}`, {
      credentials: 'include',
    });

    if (response.status === 401) {
      console.log('Authentication error (401) checking calendar status');
      isGoogleCalendarIntegratedSignal.value = false;
      return;
    }

    const data = await response.json();
    console.log('Google Calendar integration status:', data);

    // Only consider it integrated if status is "connected" AND we have valid tokens
    isGoogleCalendarIntegratedSignal.value =
      data.success && data.isConnected && data.integrationStatus === 'connected';
  } catch (err) {
    console.error('Failed to check Google Calendar integration', err);
    isGoogleCalendarIntegratedSignal.value = false;
  } finally {
    isCheckingIntegrationSignal.value = false;
  }
}

/**
 * Fetches available time slots for a therapist based on Google Calendar availability
 * Handles integration errors and automatically reconnects if needed
 */
export async function fetchAvailability(
  therapistId: number,
  selectedDate: DateTime,
  timezone: TimezoneIdentifier,
) {
  // Only proceed if we know the calendar is integrated
  if (!isGoogleCalendarIntegratedSignal.value) {
    loadingSignal.value = false;
    availableSlotsSignal.value = [];
    return;
  }

  loadingSignal.value = true;
  errorSignal.value = null;

  try {
    const startDate = selectedDate.startOf('month');
    const endDate = selectedDate.endOf('month');

    console.log('Fetching availability for:', {
      therapistId,
      startDate: startDate.toISO(),
      endDate: endDate.toISO(),
      timezone,
      currentTime: DateTime.now().setZone(timezone).toISO(),
    });

    const response = await fetch(
      `/api/sessions/availability?` +
        `therapistId=${therapistId}&` +
        `startDate=${startDate.toISO()}&` +
        `endDate=${endDate.toISO()}&` +
        `timezone=${timezone}`,
      {
        credentials: 'include',
      },
    );

    // Handle authentication/authorization errors separately
    if (response.status === 401) {
      console.error('Authentication error (401) fetching availability - need to reconnect');
      const errorData = await response.json();
      console.error('Auth error details:', errorData);

      errorSignal.value =
        'Your Google Calendar connection needs to be refreshed. Please reconnect from your profile.';

      // Show clear reconnection instructions to the user
      if (errorData.needsReconnect) {
        toast.error(
          'Google Calendar connection expired. Please reconnect from your integrations page.',
          {
            duration: 10000,
          },
        );

        // Update integrated status to false so the UI can react accordingly
        isGoogleCalendarIntegratedSignal.value = false;
      }

      availableSlotsSignal.value = [];
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();

      // For general API errors that don't require reconnection
      if (errorData.errorType === 'api_error' || errorData.errorType === 'general_error') {
        console.error('API error fetching availability:', errorData);
        throw new Error(errorData.error || 'Failed to fetch availability');
      } else {
        // For any other errors
        throw new Error(errorData.error || 'Failed to fetch availability');
      }
    }

    const data = await response.json();
    availableSlotsSignal.value = data.slots || [];
  } catch (err) {
    console.error('Error fetching availability:', err);
    errorSignal.value = err instanceof Error ? err.message : 'Failed to fetch availability';
    availableSlotsSignal.value = [];
  } finally {
    loadingSignal.value = false;
  }
}
