export interface UpcomingSession {
  id: string;
  clientId: string;
  clientName: string;
  sessionDate: string;
  sessionStartTime: string;
  therapistTimezone?: string;
  clientTimezone?: string;
  duration: number;
  sessionType: 'initial' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'pending';
  googleMeetLink?: string;
  notes?: string;
}

export interface SessionStatistics {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  cancelledSessions: number;
  averageSessionDuration: number;
  thisWeekSessions: number;
  thisMonthSessions: number;
}

export interface SessionPayment {
  id: string;
  sessionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  paymentMethod: string;
}
