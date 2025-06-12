import { signal } from '@preact-signals/safe-react';

import {
  getDashboardData,
  getClientsData,
  getSessionsData,
  invalidateOnDataChange,
} from '@/src/services/therapistDataService';

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
export const selectedNoteSignal = signal<ClientNote | null>(null);
export const isNoteFormOpenSignal = signal<boolean>(false);
export const editingNoteSignal = signal<ClientNote | null>(null);

// Add client form state signals
export const addClientFormDataSignal = signal({
  firstName: '',
  lastName: '',
  email: '',
});
export const addClientFormErrorsSignal = signal<Record<string, string>>({});
export const addClientSubmittingSignal = signal<boolean>(false);

// Optimized refresh actions using cached data service
export const refreshDashboardData = async (_force = false) => {
  const therapistId = therapistIdSignal.value;
  if (!therapistId) return;

  try {
    dashboardLoadingSignal.value = true;
    dashboardErrorSignal.value = null;

    // Use cached dashboard data service
    const dashboardData = await getDashboardData(therapistId);

    // Update all signals with cached data
    clientsSignal.value = dashboardData.clients;
    upcomingSessionsSignal.value = dashboardData.upcomingSessions;
    statisticsSignal.value = dashboardData.statistics;
    lastRefreshTimeSignal.value = new Date();

    console.log('Dashboard data refreshed from cache');
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
    dashboardErrorSignal.value = error instanceof Error ? error.message : 'Unknown error';
  } finally {
    dashboardLoadingSignal.value = false;
  }
};

export const refreshClientNotes = async (clientId: string) => {
  try {
    clientNotesLoadingSignal.value = true;
    const response = await fetch(`/api/therapist/notes?clientId=${clientId}`);
    if (response.ok) {
      const data = await response.json();
      clientNotesSignal.value = data.notes || [];
    }
  } catch (error) {
    console.error('Error refreshing notes:', error);
  } finally {
    clientNotesLoadingSignal.value = false;
  }
};

export const refreshUpcomingSessions = async () => {
  const therapistId = therapistIdSignal.value;
  if (!therapistId) return;

  try {
    // Use cached sessions data service
    const sessionsData = await getSessionsData(therapistId);
    upcomingSessionsSignal.value = sessionsData.sessions.map((session) => ({
      id: session.id.toString(),
      clientId: session.clientId?.toString() ?? '',
      clientName: session.clientName,
      sessionDate: session.sessionDate.toISOString(),
      sessionTime: session.sessionStartTime.toISOString(),
      duration: 60,
      sessionType: 'follow-up' as const,
      status: session.status as 'scheduled' | 'confirmed' | 'pending',
      meetingLink: session.googleMeetLink,
    }));

    console.log('Upcoming sessions refreshed from cache');
  } catch (error) {
    console.error('Error refreshing sessions:', error);
  }
};

export const refreshClients = async () => {
  const therapistId = therapistIdSignal.value;
  if (!therapistId) return;

  try {
    // Use cached clients data service
    const clientsData = await getClientsData(therapistId);
    clientsSignal.value = clientsData.clients.map((client) => ({
      id: client.id.toString(),
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      phone: undefined,
      createdAt: new Date().toISOString(),
      lastSessionDate: undefined,
      totalSessions: 0,
      status: 'active' as const,
    }));

    console.log('Clients refreshed from cache');
  } catch (error) {
    console.error('Error refreshing clients:', error);
  }
};

// Optimized data invalidation actions
export const invalidateClientData = async () => {
  const therapistId = therapistIdSignal.value;
  if (!therapistId) return;

  await invalidateOnDataChange(therapistId, 'client');
  await refreshDashboardData(true);
};

export const invalidateSessionData = async () => {
  const therapistId = therapistIdSignal.value;
  if (!therapistId) return;

  await invalidateOnDataChange(therapistId, 'session');
  await refreshDashboardData(true);
};

export const invalidateNoteData = async () => {
  const therapistId = therapistIdSignal.value;
  if (!therapistId) return;

  await invalidateOnDataChange(therapistId, 'note');
  // Notes don't affect dashboard data, only refresh notes for selected client
  if (selectedClientSignal.value) {
    await refreshClientNotes(selectedClientSignal.value.id);
  }
};

// Actions for session scheduling
export const openScheduleSessionModal = (client: Client) => {
  scheduleSessionClientSignal.value = client;
  isScheduleSessionModalOpenSignal.value = true;
  sessionSchedulingErrorSignal.value = null;
};

export const closeScheduleSessionModal = () => {
  isScheduleSessionModalOpenSignal.value = false;
  scheduleSessionClientSignal.value = null;
  sessionSchedulingErrorSignal.value = null;
  sessionSchedulingLoadingSignal.value = false;
};

// Actions for client notes
export const openNoteForm = (note?: ClientNote) => {
  if (note) {
    editingNoteSignal.value = note;
  } else {
    editingNoteSignal.value = null;
  }
  isNoteFormOpenSignal.value = true;
};

export const closeNoteForm = () => {
  isNoteFormOpenSignal.value = false;
  editingNoteSignal.value = null;
};

export const selectNote = (note: ClientNote | null) => {
  selectedNoteSignal.value = note;
};

// Actions for add client form
export const updateAddClientFormData = (field: string, value: string) => {
  addClientFormDataSignal.value = {
    ...addClientFormDataSignal.value,
    [field]: value,
  };
};

export const setAddClientFormErrors = (errors: Record<string, string>) => {
  addClientFormErrorsSignal.value = errors;
};

export const resetAddClientForm = () => {
  addClientFormDataSignal.value = {
    firstName: '',
    lastName: '',
    email: '',
  };
  addClientFormErrorsSignal.value = {};
  addClientSubmittingSignal.value = false;
};

export const selectClient = (client: Client | null) => {
  selectedClientSignal.value = client;
  // Clear notes when switching clients
  if (client) {
    refreshClientNotes(client.id);
  } else {
    clientNotesSignal.value = [];
  }
};

// Enhanced therapist ID initialization with retry logic
export const initializeTherapistId = async (userId: string): Promise<number | null> => {
  if (therapistIdSignal.value && therapistIdSignal.value > 0) {
    console.log('Therapist ID already initialized:', therapistIdSignal.value);
    return therapistIdSignal.value;
  }

  if (therapistIdLoadingSignal.value) {
    console.log('Therapist ID initialization already in progress');
    return null;
  }

  therapistIdLoadingSignal.value = true;
  therapistIdErrorSignal.value = null;

  console.log('Initializing therapist ID for user:', userId);

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`Fetching therapist ID - attempt ${attempts}/${maxAttempts}`);

      const response = await fetch('/api/therapist/id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.therapistId || data.therapistId <= 0) {
        throw new Error('Invalid therapist ID received from server');
      }

      console.log('Therapist ID successfully fetched:', data.therapistId);
      therapistIdSignal.value = data.therapistId;
      therapistIdLoadingSignal.value = false;
      therapistIdErrorSignal.value = null;

      return data.therapistId;
    } catch (error) {
      console.error(`Therapist ID fetch attempt ${attempts} failed:`, error);

      if (attempts >= maxAttempts) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch therapist ID';
        therapistIdErrorSignal.value = errorMessage;
        therapistIdLoadingSignal.value = false;

        // Don't set therapistId to 0 - leave it null to indicate failure
        console.error('All therapist ID fetch attempts failed:', errorMessage);
        return null;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempts - 1) * 1000; // 1s, 2s, 4s
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  therapistIdLoadingSignal.value = false;
  return null;
};

// Safe getter that ensures valid therapist ID
export const getValidTherapistId = (): number | null => {
  const id = therapistIdSignal.value;
  return id && id > 0 ? id : null;
};
