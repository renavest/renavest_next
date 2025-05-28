export type Client = {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
};

export type UpcomingSession = {
  id: string;
  clientId: string;
  clientName?: string;
  sessionDate: string;
  sessionStartTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  googleMeetLink?: string;
  therapistTimezone?: string;
  clientTimezone?: string;
};

export type TherapistStatistics = {
  totalSessions: number;
  totalClients: number;
  completedSessions: number;
};

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

// Re-export profile types
export * from './profile';
