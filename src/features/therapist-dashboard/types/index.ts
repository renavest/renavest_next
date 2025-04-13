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
};

export type TherapistStatistics = {
  totalSessions: number;
  totalClients: number;
  completedSessions: number;
};

export type CreateClientNoteInput = {
  userId: string;
  therapistId: number;
  sessionId?: number;
  title: string;
  content: {
    keyObservations?: string[];
    progressNotes?: string[];
    actionItems?: string[];
    emotionalState?: string;
    additionalContext?: string;
  };
  isConfidential: boolean;
};
