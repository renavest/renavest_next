import { signal } from '@preact-signals/safe-react';

export interface ClientMetrics {
  totalClients: number;
  activeClients: number;
  averageSessionsPerClient: number;
  clientSatisfactionRate: number;
}

export interface SessionStats {
  completedSessions: number;
  upcomingSessions: number;
  cancellationRate: number;
  averageSessionDuration: number;
}

export interface EarningsMetrics {
  currentMonthEarnings: number;
  previousMonthEarnings: number;
  projectedEarnings: number;
  pendingPayouts: number;
}

// Sample data for now
export const clientMetricsSignal = signal<ClientMetrics>({
  totalClients: 45,
  activeClients: 32,
  averageSessionsPerClient: 6,
  clientSatisfactionRate: 92,
});

export const sessionStatsSignal = signal<SessionStats>({
  completedSessions: 128,
  upcomingSessions: 15,
  cancellationRate: 5,
  averageSessionDuration: 50,
});

export const earningsMetricsSignal = signal<EarningsMetrics>({
  currentMonthEarnings: 8500,
  previousMonthEarnings: 7800,
  projectedEarnings: 9200,
  pendingPayouts: 2400,
});
