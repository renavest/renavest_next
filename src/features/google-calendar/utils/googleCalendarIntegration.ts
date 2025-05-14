import { signal } from '@preact-signals/safe-react';
import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Represents the integration status with Google Calendar
 */
interface IntegrationStatus {
  isConnected: boolean | null;
  isLoading: boolean;
  calendarEmail?: string | null;
  lastSynced?: string | null;
  error?: string | null;
}

// Create a signal to store integration statuses keyed by therapist ID
const googleCalendarIntegrationStatusSignal = signal<Record<string, IntegrationStatus>>({});

// Track which therapists we've already fetched
const fetchedTherapistIds = new Set<string>();

/**
 * Fetches the current Google Calendar integration status for a therapist
 */
export async function fetchGoogleCalendarStatus(
  therapistId: number | string,
): Promise<IntegrationStatus> {
  const idStr = String(therapistId);
  const statusMap = googleCalendarIntegrationStatusSignal.value;

  // If already loading, don't refetch
  if (statusMap[idStr]?.isLoading) {
    return statusMap[idStr];
  }

  // Set loading state
  googleCalendarIntegrationStatusSignal.value = {
    ...statusMap,
    [idStr]: {
      isConnected: null,
      isLoading: true,
      calendarEmail: null,
      lastSynced: null,
      error: null,
    },
  };

  try {
    const response = await fetch(`/api/google-calendar/status?therapistId=${therapistId}`);
    const data = await response.json();

    const newStatus = {
      isConnected: !!data.isConnected,
      isLoading: false,
      calendarEmail: data.calendarEmail || null,
      lastSynced: data.lastSynced || null,
      error: data.success === false ? data.message || 'Failed to fetch status' : null,
    };

    // Update the signal
    googleCalendarIntegrationStatusSignal.value = {
      ...googleCalendarIntegrationStatusSignal.value,
      [idStr]: newStatus,
    };

    return newStatus;
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);

    const errorStatus = {
      isConnected: false,
      isLoading: false,
      calendarEmail: null,
      lastSynced: null,
      error: 'Failed to check Google Calendar status',
    };

    // Update the signal
    googleCalendarIntegrationStatusSignal.value = {
      ...googleCalendarIntegrationStatusSignal.value,
      [idStr]: errorStatus,
    };

    return errorStatus;
  }
}

/**
 * Initiates the Google Calendar connection flow
 */
async function initiateGoogleCalendarConnection(therapistId: number | string): Promise<boolean> {
  try {
    const idStr = String(therapistId);
    const statusMap = googleCalendarIntegrationStatusSignal.value;

    // Set loading state
    googleCalendarIntegrationStatusSignal.value = {
      ...statusMap,
      [idStr]: {
        ...(statusMap[idStr] || { isConnected: false }),
        isLoading: true,
        error: null,
      },
    };

    const authResponse = await fetch(`/api/google-calendar?therapistId=${therapistId}`, {
      method: 'GET',
    });

    const { authUrl } = await authResponse.json();

    if (authUrl) {
      // Redirect to Google OAuth consent screen
      window.location.href = authUrl;
      return true;
    } else {
      throw new Error('No authentication URL returned');
    }
  } catch (error) {
    console.error('Error initiating Google Calendar connection:', error);
    toast.error('Failed to connect Google Calendar');
    return false;
  }
}

/**
 * Disconnects Google Calendar integration
 */
async function disconnectGoogleCalendar(therapistId: number | string): Promise<boolean> {
  const idStr = String(therapistId);
  const statusMap = googleCalendarIntegrationStatusSignal.value;

  try {
    // Set loading state
    googleCalendarIntegrationStatusSignal.value = {
      ...statusMap,
      [idStr]: {
        ...(statusMap[idStr] || { isConnected: false }),
        isLoading: true,
        error: null,
      },
    };

    const response = await fetch('/api/google-calendar/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ therapistId }),
    });

    const data = await response.json();

    if (data.success) {
      // Update the signal
      googleCalendarIntegrationStatusSignal.value = {
        ...googleCalendarIntegrationStatusSignal.value,
        [idStr]: {
          isConnected: false,
          isLoading: false,
          calendarEmail: null,
          lastSynced: null,
          error: null,
        },
      };

      toast.success('Google Calendar disconnected successfully');
      return true;
    } else {
      // Update the signal with error
      googleCalendarIntegrationStatusSignal.value = {
        ...googleCalendarIntegrationStatusSignal.value,
        [idStr]: {
          ...(googleCalendarIntegrationStatusSignal.value[idStr] || { isConnected: false }),
          isLoading: false,
          error: data.message || 'Failed to disconnect Google Calendar',
        },
      };

      toast.error(data.message || 'Failed to disconnect Google Calendar');
      return false;
    }
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);

    // Update the signal with error
    googleCalendarIntegrationStatusSignal.value = {
      ...googleCalendarIntegrationStatusSignal.value,
      [idStr]: {
        ...(googleCalendarIntegrationStatusSignal.value[idStr] || { isConnected: false }),
        isLoading: false,
        error: 'Failed to disconnect Google Calendar',
      },
    };

    toast.error('Failed to disconnect Google Calendar');
    return false;
  }
}

/**
 * Fetch therapist ID from user ID
 */
export async function fetchTherapistId(userId?: string): Promise<number | null> {
  if (!userId) return null;
  try {
    const response = await fetch('/api/therapist/id');
    const data = await response.json();
    return data.therapistId || null;
  } catch (error) {
    console.error('Failed to fetch therapist ID:', error);
    return null;
  }
}

/**
 * Reconnects Google Calendar - disconnects first, then initiates a new connection
 */
async function reconnectGoogleCalendar(therapistId: number | string): Promise<boolean> {
  const idStr = String(therapistId);
  const statusMap = googleCalendarIntegrationStatusSignal.value;

  try {
    // Set loading state
    googleCalendarIntegrationStatusSignal.value = {
      ...statusMap,
      [idStr]: {
        ...(statusMap[idStr] || { isConnected: false }),
        isLoading: true,
        error: null,
      },
    };

    // Disconnect first
    await disconnectGoogleCalendar(therapistId);

    // Then initiate connection
    return await initiateGoogleCalendarConnection(therapistId);
  } catch (error) {
    console.error('Error reconnecting Google Calendar:', error);

    // Update the signal with error
    googleCalendarIntegrationStatusSignal.value = {
      ...googleCalendarIntegrationStatusSignal.value,
      [idStr]: {
        ...(googleCalendarIntegrationStatusSignal.value[idStr] || { isConnected: false }),
        isLoading: false,
        error: 'Failed to reconnect Google Calendar',
      },
    };

    toast.error('Failed to reconnect Google Calendar');
    return false;
  }
}

/**
 * Hook for managing Google Calendar integration status
 */
export function useGoogleCalendarIntegration(therapistId: string | number) {
  const idStr = String(therapistId);

  // Fetch status on mount if not already fetched
  useEffect(() => {
    if (!fetchedTherapistIds.has(idStr)) {
      fetchGoogleCalendarStatus(idStr);
      fetchedTherapistIds.add(idStr);
    }
  }, [idStr]);

  // Refresh status handler
  const refreshStatus = useCallback(() => {
    fetchGoogleCalendarStatus(idStr);
  }, [idStr]);

  // Connect handler
  const connect = useCallback(() => {
    return initiateGoogleCalendarConnection(idStr);
  }, [idStr]);

  // Disconnect handler
  const disconnect = useCallback(() => {
    return disconnectGoogleCalendar(idStr);
  }, [idStr]);

  // Reconnect handler
  const reconnect = useCallback(() => {
    return reconnectGoogleCalendar(idStr);
  }, [idStr]);

  // Get current status
  const status = googleCalendarIntegrationStatusSignal.value[idStr] || {
    isConnected: null,
    isLoading: true,
    calendarEmail: null,
    lastSynced: null,
    error: null,
  };

  return {
    status,
    refreshStatus,
    connect,
    disconnect,
    reconnect,
  };
}
