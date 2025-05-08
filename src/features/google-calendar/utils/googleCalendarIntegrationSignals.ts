import { signal } from '@preact-signals/safe-react';
import { useEffect } from 'react';

interface IntegrationStatus {
  isConnected: boolean | null;
  isLoading: boolean;
  error?: string;
}

// Keyed by therapistId
export const googleCalendarIntegrationStatusSignal = signal<Record<string, IntegrationStatus>>({});

const fetchedTherapistIds = new Set<string>();

export async function fetchGoogleCalendarIntegrationStatus(therapistId: string) {
  const statusMap = googleCalendarIntegrationStatusSignal.value;
  // If already loading, don't refetch
  if (statusMap[therapistId]?.isLoading) return;
  // Set loading state
  googleCalendarIntegrationStatusSignal.value = {
    ...statusMap,
    [therapistId]: { isConnected: null, isLoading: true },
  };
  try {
    const res = await fetch(`/api/google-calendar/status?therapistId=${therapistId}`);
    const data = await res.json();
    googleCalendarIntegrationStatusSignal.value = {
      ...googleCalendarIntegrationStatusSignal.value,
      [therapistId]: {
        isConnected: !!data.isConnected,
        isLoading: false,
        error: undefined,
      },
    };
  } catch (error) {
    console.error('Error fetching Google Calendar integration status:', error);
    googleCalendarIntegrationStatusSignal.value = {
      ...googleCalendarIntegrationStatusSignal.value,
      [therapistId]: {
        isConnected: false,
        isLoading: false,
        error: 'Failed to fetch integration status',
      },
    };
  }
}

/**
 * Custom hook to get and manage Google Calendar integration status for a therapist.
 * Ensures only one fetch per therapistId per mount/session unless manually refreshed.
 */
export function useGoogleCalendarIntegrationStatus(therapistId: string | number) {
  const idStr = String(therapistId);

  useEffect(() => {
    if (!fetchedTherapistIds.has(idStr)) {
      fetchGoogleCalendarIntegrationStatus(idStr);
      fetchedTherapistIds.add(idStr);
    }
  }, [idStr]);

  // Always return the latest status for this therapistId
  const status = googleCalendarIntegrationStatusSignal.value[idStr] || {
    isConnected: null,
    isLoading: true,
    error: undefined,
  };

  return { ...status };
}
