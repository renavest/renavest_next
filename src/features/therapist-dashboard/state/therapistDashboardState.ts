import { signal } from '@preact-signals/safe-react';

import { Client, UpcomingSession, TherapistStatistics } from '../types';

export const therapistPageLoadedSignal = signal(false);
export const therapistIdSignal = signal<number | null>(null);
export const therapistIdLoadingSignal = signal<boolean>(false);
export const therapistIdErrorSignal = signal<string | null>(null);

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

export const refreshUpcomingSessions = async () => {
  try {
    const response = await fetch('/api/therapist/sessions');
    if (response.ok) {
      const data = await response.json();
      upcomingSessionsSignal.value = data.sessions.map(
        (session: {
          id: number;
          clientId: number;
          clientName: string;
          sessionDate: string;
          sessionStartTime: string;
          status: string;
          googleMeetLink: string;
          therapistTimezone: string;
          clientTimezone: string;
        }) => ({
          id: session.id.toString(),
          clientId: session.clientId?.toString() ?? '',
          clientName: session.clientName,
          sessionDate: session.sessionDate,
          sessionStartTime: session.sessionStartTime,
          status: session.status,
          googleMeetLink: session.googleMeetLink,
          therapistTimezone: session.therapistTimezone,
          clientTimezone: session.clientTimezone,
        }),
      );
    }
  } catch (error) {
    console.error('Error refreshing sessions:', error);
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
