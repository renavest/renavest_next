import { signal } from '@preact-signals/safe-react';

// Note: Using API calls instead of direct database imports for client-side compatibility

import { Client, UpcomingSession, TherapistStatistics, ClientNote } from '../types';
import { TherapistPaymentState, StripeConnectStatus } from '../types/payments';
import { SessionCompletionState } from '../types/session';

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

// Session completion state - avoiding prop drilling
export const sessionCompletionSignal = signal<SessionCompletionState>({
  sessions: [],
  loading: false,
  error: null,
  completing: new Set(),
});

// Payment state - avoiding prop drilling
export const therapistPaymentSignal = signal<TherapistPaymentState>({
  paymentSettings: {
    stripeConnectStatus: {
      connected: false,
      onboardingStatus: 'not_started',
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    },
    acceptingPayments: false,
    bankAccountConnected: false,
  },
  sessionPayments: [],
  integrationState: {
    stripeConnectStatus: {
      connected: false,
      onboardingStatus: 'not_started',
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    },
    loading: false,
    connecting: false,
    error: null,
  },
});

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

// Session completion actions
export const fetchCompletableSessions = async () => {
  const current = sessionCompletionSignal.value;
  sessionCompletionSignal.value = { ...current, loading: true, error: null };

  try {
    const response = await fetch('/api/therapist/sessions/completable');
    if (!response.ok) {
      throw new Error('Failed to fetch completable sessions');
    }

    const data = await response.json();
    sessionCompletionSignal.value = {
      ...current,
      sessions: data.sessions || [],
      loading: false,
    };
  } catch (error) {
    console.error('Error fetching completable sessions:', error);
    sessionCompletionSignal.value = {
      ...current,
      loading: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sessions',
    };
  }
};

export const completeSession = async (sessionId: number) => {
  const current = sessionCompletionSignal.value;
  const newCompleting = new Set(current.completing);
  newCompleting.add(sessionId);

  sessionCompletionSignal.value = { ...current, completing: newCompleting };

  try {
    const response = await fetch('/api/therapist/sessions/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete session');
    }

    // Refresh sessions after completion
    await fetchCompletableSessions();
  } catch (error) {
    console.error('Error completing session:', error);
    const currentAfterError = sessionCompletionSignal.value;
    const completingAfterError = new Set(currentAfterError.completing);
    completingAfterError.delete(sessionId);

    sessionCompletionSignal.value = {
      ...currentAfterError,
      completing: completingAfterError,
      error: error instanceof Error ? error.message : 'Failed to complete session',
    };
    throw error;
  }

  const finalCurrent = sessionCompletionSignal.value;
  const finalCompleting = new Set(finalCurrent.completing);
  finalCompleting.delete(sessionId);
  sessionCompletionSignal.value = { ...finalCurrent, completing: finalCompleting };
};

// Payment integration actions
export const fetchStripeConnectStatus = async () => {
  const current = therapistPaymentSignal.value;
  therapistPaymentSignal.value = {
    ...current,
    integrationState: { ...current.integrationState, loading: true, error: null },
  };

  try {
    const response = await fetch('/api/stripe/connect/status');
    if (!response.ok) {
      throw new Error('Failed to fetch Stripe Connect status');
    }

    const data = await response.json();
    const stripeConnectStatus: StripeConnectStatus = {
      connected: data.connected,
      accountId: data.accountId,
      onboardingStatus: data.onboardingStatus,
      chargesEnabled: data.chargesEnabled,
      payoutsEnabled: data.payoutsEnabled,
      detailsSubmitted: data.detailsSubmitted,
      requiresAction: data.requiresAction,
      requirements: data.requirements,
    };

    therapistPaymentSignal.value = {
      ...current,
      paymentSettings: {
        ...current.paymentSettings,
        stripeConnectStatus,
        bankAccountConnected: data.connected && data.payoutsEnabled,
        acceptingPayments: data.connected && data.chargesEnabled && data.payoutsEnabled,
      },
      integrationState: {
        ...current.integrationState,
        stripeConnectStatus,
        loading: false,
      },
    };
  } catch (error) {
    console.error('Error fetching Stripe Connect status:', error);
    therapistPaymentSignal.value = {
      ...current,
      integrationState: {
        ...current.integrationState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch status',
      },
    };
  }
};

export const initiateStripeConnection = async () => {
  const current = therapistPaymentSignal.value;
  therapistPaymentSignal.value = {
    ...current,
    integrationState: { ...current.integrationState, connecting: true, error: null },
  };

  try {
    const response = await fetch('/api/stripe/connect/oauth');
    const data = await response.json();

    if (response.ok) {
      if (data.connected) {
        await fetchStripeConnectStatus();
      } else if (data.url) {
        window.location.href = data.url;
      }
    } else {
      throw new Error(data.error || 'Failed to initiate bank account connection');
    }
  } catch (error) {
    console.error('Error connecting bank account:', error);
    therapistPaymentSignal.value = {
      ...current,
      integrationState: {
        ...current.integrationState,
        connecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect',
      },
    };
  }
};

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
