import { signal } from '@preact-signals/safe-react';

import {
  ClientMetrics,
  SessionStats,
  EarningsMetrics,
  Client,
  UpcomingSession,
  TherapistStatistics,
} from '../types';

export const therapistPageLoadedSignal = signal(false);
export const therapistIdSignal = signal<number | null>(null);
const clientMetricsSignal = signal<ClientMetrics>({
  totalClients: 45,
  activeClients: 32,
  averageSessionsPerClient: 6,
  clientSatisfactionRate: 92,
});

const sessionStatsSignal = signal<SessionStats>({
  completedSessions: 128,
  upcomingSessions: 15,
  cancellationRate: 5,
  averageSessionDuration: 50,
});

const earningsMetricsSignal = signal<EarningsMetrics>({
  currentMonthEarnings: 8500,
  previousMonthEarnings: 7800,
  projectedEarnings: 9200,
  pendingPayouts: 2400,
});

// Dashboard state signals
export const clientsSignal = signal<Client[]>([]);
export const upcomingSessionsSignal = signal<UpcomingSession[]>([]);
export const statisticsSignal = signal<TherapistStatistics>({
  totalSessions: 0,
  totalClients: 0,
  completedSessions: 0,
});
export const selectedClientSignal = signal<Client | null>(null);
export const isAddClientOpenSignal = signal<boolean>(false);
