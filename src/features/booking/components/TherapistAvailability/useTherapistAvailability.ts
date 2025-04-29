import { signal } from '@preact-signals/safe-react';
import { DateTime } from 'luxon';
import { TimezoneIdentifier } from '../../utils/dateTimeUtils';

export const timezoneSignal = signal<TimezoneIdentifier>('America/New_York');
export const availableSlotsSignal = signal<any[]>([]);
export const loadingSignal = signal(true);
export const errorSignal = signal<string | null>(null);
export const isGoogleCalendarIntegratedSignal = signal(false);
export const isCheckingIntegrationSignal = signal(true);

export async function checkGoogleCalendarIntegration(therapistId: number) {
  try {
    const response = await fetch(`/api/google-calendar/status?therapistId=${therapistId}`, {
      credentials: 'include',
    });
    if (response.status === 401) {
      isGoogleCalendarIntegratedSignal.value = false;
      return;
    }
    const data = await response.json();
    isGoogleCalendarIntegratedSignal.value = data.success && data.isConnected;
  } catch (err) {
    console.error('Failed to check Google Calendar integration', err);
    isGoogleCalendarIntegratedSignal.value = false;
  } finally {
    isCheckingIntegrationSignal.value = false;
  }
}

export async function fetchAvailability(
  therapistId: number,
  selectedDate: DateTime,
  timezone: TimezoneIdentifier,
) {
  if (!isGoogleCalendarIntegratedSignal.value) {
    loadingSignal.value = false;
    return;
  }
  loadingSignal.value = true;
  errorSignal.value = null;
  try {
    const startDate = selectedDate.startOf('month');
    const endDate = selectedDate.endOf('month');
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
    if (!response.ok) {
      throw new Error('Failed to fetch availability');
    }
    const data = await response.json();
    availableSlotsSignal.value = data.slots || [];
  } catch (err) {
    console.error('Error fetching availability:', err);
    errorSignal.value = err instanceof Error ? err.message : 'Failed to fetch availability';
  } finally {
    loadingSignal.value = false;
  }
}
