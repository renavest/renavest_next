import { signal } from '@preact-signals/safe-react';

// Note: Using API calls instead of direct database imports for client-side compatibility

import { Client, UpcomingSession, TherapistStatistics, ClientNote } from '../types';

export const therapistPageLoadedSignal = signal(false);
export const therapistIdSignal = signal<number | null>(null);
export const therapistIdLoadingSignal = signal<boolean>(false);
export const therapistIdErrorSignal = signal<string | null>(null);

// Cache control signals
export const dashboardLoadingSignal = signal<boolean>(false);
export const dashboardErrorSignal = signal<string | null>(null);
export const lastRefreshTimeSignal = signal<Date | null>(null);

// Dashboard state signals
export const clientsSignal = signal<Client[]>([]);
export const upcomingSessionsSignal = signal<UpcomingSession[]>([]);
export const statisticsSignal = signal<TherapistStatistics>({
  totalClients: 0,
  activeClients: 0,
  totalSessions: 0,
  upcomingSessions: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  completionRate: 0,
});
export const selectedClientSignal = signal<Client | null>(null);
export const isAddClientOpenSignal = signal<boolean>(false);

// Session scheduling state signals
export const isScheduleSessionModalOpenSignal = signal<boolean>(false);
export const scheduleSessionClientSignal = signal<Client | null>(null);
export const sessionSchedulingLoadingSignal = signal<boolean>(false);
export const sessionSchedulingErrorSignal = signal<string | null>(null);

// Client notes state signals
export const clientNotesSignal = signal<ClientNote[]>([]);
export const clientNotesLoadingSignal = signal<boolean>(false);

// Add client form state signals
export const addClientFormDataSignal = signal({
  firstName: '',
  lastName: '',
  email: '',
});
export const addClientSubmittingSignal = signal<boolean>(false);

export const refreshUpcomingSessions = async () => {
  const therapistId = therapistIdSignal.value;
  if (!therapistId) return;

  try {
    // Use API endpoint instead of direct database access
    const response = await fetch('/api/therapist/sessions');
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    const sessionsData = await response.json();
    upcomingSessionsSignal.value = (sessionsData.sessions || []).map(
      (session: {
        id: number;
        clientId?: number;
        clientName: string;
        sessionDate: string;
        sessionStartTime: string;
        status: string;
        googleMeetLink?: string;
        therapistTimezone?: string;
        clientTimezone?: string;
      }) => ({
        id: session.id.toString(),
        clientId: session.clientId?.toString() ?? '',
        clientName: session.clientName,
        sessionDate: session.sessionDate,
        sessionStartTime: session.sessionStartTime,
        therapistTimezone: session.therapistTimezone,
        clientTimezone: session.clientTimezone,
        duration: 60,
        sessionType: 'follow-up' as const,
        status: session.status as 'scheduled' | 'confirmed' | 'pending',
        googleMeetLink: session.googleMeetLink,
      }),
    );

    console.log('Upcoming sessions refreshed from API');
  } catch (error) {
    console.error('Error refreshing sessions:', error);
  }
};

// Actions for session scheduling
export const openScheduleSessionModal = (client: Client) => {
  scheduleSessionClientSignal.value = client;
  isScheduleSessionModalOpenSignal.value = true;
};

export const closeScheduleSessionModal = () => {
  isScheduleSessionModalOpenSignal.value = false;
  scheduleSessionClientSignal.value = null;
  sessionSchedulingErrorSignal.value = null;
};

export const updateAddClientFormData = (field: string, value: string) => {
  addClientFormDataSignal.value = {
    ...addClientFormDataSignal.value,
    [field]: value,
  };
};

export const resetAddClientForm = () => {
  addClientFormDataSignal.value = {
    firstName: '',
    lastName: '',
    email: '',
  };
};

export const selectClient = (client: Client | null) => {
  selectedClientSignal.value = client;
  if (client) {
    // Automatically refresh notes when a client is selected using API
    fetch(`/api/therapist/notes?clientId=${client.id}`)
      .then((response) => response.json())
      .then((data) => {
        clientNotesSignal.value = data.notes || [];
      })
      .catch((error) => console.error('Error loading client notes:', error));
  } else {
    clientNotesSignal.value = [];
  }
};

export const initializeTherapistId = async (_userId: string): Promise<number | null> => {
  try {
    therapistIdLoadingSignal.value = true;
    therapistIdErrorSignal.value = null;

    // Use API endpoint to get therapist ID
    const response = await fetch('/api/therapist/id');
    if (!response.ok) {
      throw new Error('Failed to fetch therapist ID');
    }

    const data = await response.json();
    const therapistId = data.therapistId;

    if (therapistId) {
      therapistIdSignal.value = therapistId;
      console.log('Therapist ID initialized from API:', therapistId);
      return therapistId;
    } else {
      throw new Error('No therapist profile found');
    }
  } catch (error) {
    console.error('Error initializing therapist ID:', error);
    therapistIdErrorSignal.value = error instanceof Error ? error.message : 'Unknown error';
    return null;
  } finally {
    therapistIdLoadingSignal.value = false;
  }
};

export const getValidTherapistId = (): number | null => {
  const therapistId = therapistIdSignal.value;
  if (!therapistId) {
    console.error('No valid therapist ID available');
    return null;
  }
  return therapistId;
};
