'use client';

import { signal } from '@preact-signals/safe-react';
import { useUser } from '@clerk/nextjs';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';

import type {
  GoogleCalendarIntegrationState,
  GoogleCalendarActions,
  GoogleCalendarContextValue,
  GoogleCalendarStatusResponse,
} from '../types';

// === Signals ===

// Global signal for Google Calendar integration status by therapist ID
export const googleCalendarStatusSignal = signal<Record<string, GoogleCalendarIntegrationState>>(
  {},
);

// Signal for current therapist ID
export const currentTherapistIdSignal = signal<string | null>(null);

// Signal for tracking which therapists we've already fetched
export const fetchedTherapistIdsSignal = signal<Set<string>>(new Set());

// === Context ===

const GoogleCalendarContext = createContext<GoogleCalendarContextValue | null>(null);

// === Utility Functions ===

/**
 * Fetches therapist ID from the current user
 */
async function fetchTherapistIdFromUser(userId?: string): Promise<number | null> {
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
 * Fetches Google Calendar status for a therapist
 */
async function fetchGoogleCalendarStatus(therapistId: string): Promise<void> {
  const currentStatus = googleCalendarStatusSignal.value[therapistId];

  // If already loading, don't refetch
  if (currentStatus?.isLoading) {
    return;
  }

  // Set loading state
  googleCalendarStatusSignal.value = {
    ...googleCalendarStatusSignal.value,
    [therapistId]: {
      isConnected: null,
      isLoading: true,
      calendarEmail: null,
      lastSynced: null,
      error: null,
    },
  };

  try {
    const response = await fetch(`/api/google-calendar/status?therapistId=${therapistId}`);
    const data: GoogleCalendarStatusResponse = await response.json();

    const newStatus: GoogleCalendarIntegrationState = {
      isConnected: !!data.isConnected,
      isLoading: false,
      calendarEmail: data.calendarEmail || null,
      lastSynced: data.lastSynced || null,
      error: data.success === false ? data.message || 'Failed to fetch status' : null,
    };

    // Update the signal
    googleCalendarStatusSignal.value = {
      ...googleCalendarStatusSignal.value,
      [therapistId]: newStatus,
    };

    // Mark as fetched
    const newFetchedIds = new Set(fetchedTherapistIdsSignal.value);
    newFetchedIds.add(therapistId);
    fetchedTherapistIdsSignal.value = newFetchedIds;
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);

    const errorStatus: GoogleCalendarIntegrationState = {
      isConnected: false,
      isLoading: false,
      calendarEmail: null,
      lastSynced: null,
      error: 'Failed to check Google Calendar status',
    };

    // Update the signal
    googleCalendarStatusSignal.value = {
      ...googleCalendarStatusSignal.value,
      [therapistId]: errorStatus,
    };
  }
}

/**
 * Initiates Google Calendar connection
 */
async function initiateGoogleCalendarConnection(therapistId: string): Promise<boolean> {
  try {
    const currentStatuses = googleCalendarStatusSignal.value;

    // Set loading state
    googleCalendarStatusSignal.value = {
      ...currentStatuses,
      [therapistId]: {
        ...(currentStatuses[therapistId] || { isConnected: false }),
        isLoading: true,
        error: null,
      },
    };

    const authResponse = await fetch(`/api/google-calendar?therapistId=${therapistId}`, {
      method: 'GET',
    });

    const data = await authResponse.json();

    if (data.authUrl) {
      // Redirect to Google OAuth consent screen
      window.location.href = data.authUrl;
      return true;
    } else {
      throw new Error('No authentication URL returned');
    }
  } catch (error) {
    console.error('Error initiating Google Calendar connection:', error);
    toast.error('Failed to connect Google Calendar');

    // Reset loading state
    const currentStatuses = googleCalendarStatusSignal.value;
    googleCalendarStatusSignal.value = {
      ...currentStatuses,
      [therapistId]: {
        ...(currentStatuses[therapistId] || { isConnected: false }),
        isLoading: false,
        error: 'Failed to initiate connection',
      },
    };

    return false;
  }
}

/**
 * Disconnects Google Calendar integration
 */
async function disconnectGoogleCalendar(therapistId: string): Promise<boolean> {
  try {
    const currentStatuses = googleCalendarStatusSignal.value;

    // Set loading state
    googleCalendarStatusSignal.value = {
      ...currentStatuses,
      [therapistId]: {
        ...(currentStatuses[therapistId] || { isConnected: false }),
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
      googleCalendarStatusSignal.value = {
        ...googleCalendarStatusSignal.value,
        [therapistId]: {
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
      googleCalendarStatusSignal.value = {
        ...googleCalendarStatusSignal.value,
        [therapistId]: {
          ...(googleCalendarStatusSignal.value[therapistId] || { isConnected: false }),
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
    googleCalendarStatusSignal.value = {
      ...googleCalendarStatusSignal.value,
      [therapistId]: {
        ...(googleCalendarStatusSignal.value[therapistId] || { isConnected: false }),
        isLoading: false,
        error: 'Failed to disconnect Google Calendar',
      },
    };

    toast.error('Failed to disconnect Google Calendar');
    return false;
  }
}

/**
 * Reconnects Google Calendar (disconnect + connect)
 */
async function reconnectGoogleCalendar(therapistId: string): Promise<boolean> {
  try {
    const currentStatuses = googleCalendarStatusSignal.value;

    // Set loading state
    googleCalendarStatusSignal.value = {
      ...currentStatuses,
      [therapistId]: {
        ...(currentStatuses[therapistId] || { isConnected: false }),
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
    googleCalendarStatusSignal.value = {
      ...googleCalendarStatusSignal.value,
      [therapistId]: {
        ...(googleCalendarStatusSignal.value[therapistId] || { isConnected: false }),
        isLoading: false,
        error: 'Failed to reconnect Google Calendar',
      },
    };

    toast.error('Failed to reconnect Google Calendar');
    return false;
  }
}

// === Provider Component ===

interface GoogleCalendarProviderProps {
  children: ReactNode;
  initialTherapistId?: string | number;
}

export function GoogleCalendarProvider({
  children,
  initialTherapistId,
}: GoogleCalendarProviderProps) {
  const { user } = useUser();

  // Initialize therapist ID
  useEffect(() => {
    async function initializeTherapistId() {
      if (initialTherapistId) {
        currentTherapistIdSignal.value = String(initialTherapistId);
      } else if (user?.id) {
        // Try to get from metadata first
        const id = user.publicMetadata?.therapistId || (await fetchTherapistIdFromUser(user.id));
        currentTherapistIdSignal.value = id ? String(id) : null;
      }
    }

    initializeTherapistId();
  }, [user, initialTherapistId]);

  // Auto-fetch status when therapist ID is available and not already fetched
  useEffect(() => {
    const therapistId = currentTherapistIdSignal.value;
    const fetchedIds = fetchedTherapistIdsSignal.value;

    if (therapistId && !fetchedIds.has(therapistId)) {
      fetchGoogleCalendarStatus(therapistId);
    }
  }, [currentTherapistIdSignal.value]);

  // Create actions object
  const actions: GoogleCalendarActions = {
    connect: () => {
      const therapistId = currentTherapistIdSignal.value;
      return therapistId ? initiateGoogleCalendarConnection(therapistId) : Promise.resolve(false);
    },
    disconnect: () => {
      const therapistId = currentTherapistIdSignal.value;
      return therapistId ? disconnectGoogleCalendar(therapistId) : Promise.resolve(false);
    },
    reconnect: () => {
      const therapistId = currentTherapistIdSignal.value;
      return therapistId ? reconnectGoogleCalendar(therapistId) : Promise.resolve(false);
    },
    refreshStatus: () => {
      const therapistId = currentTherapistIdSignal.value;
      if (therapistId) {
        fetchGoogleCalendarStatus(therapistId);
      }
    },
  };

  // Get current status from signal
  const therapistId = currentTherapistIdSignal.value;
  const isValidTherapistId = !!(therapistId && therapistId !== '0');

  const status =
    isValidTherapistId && therapistId
      ? googleCalendarStatusSignal.value[therapistId] || {
          isConnected: null,
          isLoading: true,
          calendarEmail: null,
          lastSynced: null,
          error: null,
        }
      : {
          isConnected: null,
          isLoading: false,
          calendarEmail: null,
          lastSynced: null,
          error: null,
        };

  const contextValue: GoogleCalendarContextValue = {
    status,
    actions,
    therapistId,
    isValidTherapistId,
  };

  return (
    <GoogleCalendarContext.Provider value={contextValue}>{children}</GoogleCalendarContext.Provider>
  );
}

// === Hook ===

/**
 * Hook to access Google Calendar integration state and actions
 * This replaces the need for prop drilling
 */
export function useGoogleCalendarContext(): GoogleCalendarContextValue {
  const context = useContext(GoogleCalendarContext);

  if (!context) {
    throw new Error('useGoogleCalendarContext must be used within a GoogleCalendarProvider');
  }

  return context;
}

// === Utility Functions for External Use ===

/**
 * Get status for a specific therapist (useful for components that need different therapist data)
 */
export function getTherapistStatus(therapistId: string): GoogleCalendarIntegrationState {
  return (
    googleCalendarStatusSignal.value[therapistId] || {
      isConnected: null,
      isLoading: false,
      calendarEmail: null,
      lastSynced: null,
      error: null,
    }
  );
}

/**
 * Update status for a specific therapist (useful for API responses)
 */
export function updateTherapistStatus(
  therapistId: string,
  status: Partial<GoogleCalendarIntegrationState>,
): void {
  googleCalendarStatusSignal.value = {
    ...googleCalendarStatusSignal.value,
    [therapistId]: {
      ...googleCalendarStatusSignal.value[therapistId],
      ...status,
    },
  };
}

/**
 * Clear all cached status data (useful for logout/reset)
 */
export function clearGoogleCalendarCache(): void {
  googleCalendarStatusSignal.value = {};
  currentTherapistIdSignal.value = null;
  fetchedTherapistIdsSignal.value = new Set();
}

/**
 * Utility function to fetch therapist ID from user ID
 * This replaces the old fetchTherapistId from the deleted integration file
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
