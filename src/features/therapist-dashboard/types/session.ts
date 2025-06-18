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

// Session completion specific types
export interface CompletableSession {
  id: number;
  clientName?: string;
  sessionDate: Date;
  sessionStartTime: Date;
  sessionEndTime: Date;
  status: string;
  hourlyRateCents?: number;
  paymentRequired: boolean;
}

export interface SessionCompletionState {
  sessions: CompletableSession[];
  loading: boolean;
  error: string | null;
  completing: Set<number>;
}

export interface SessionCompletionActions {
  fetchSessions: () => Promise<void>;
  completeSession: (sessionId: number) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

// Enhanced session completion card props with proper typing
export interface SessionCompletionCardProps {
  session: CompletableSession;
  onCompleteSession: (sessionId: number) => Promise<void>;
  className?: string;
  isLoading?: boolean;
}
