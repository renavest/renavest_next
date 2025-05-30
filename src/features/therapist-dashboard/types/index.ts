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

// Notes and Documentation Types - Flexible structure that works with existing DB schema
export type NoteCategory = 'session' | 'intake' | 'progress' | 'crisis' | 'general' | 'discharge';

// Extending the existing schema's content type to be more flexible
export interface ClientNoteContent {
  // Original schema fields (maintained for compatibility)
  keyObservations?: string[];
  progressNotes?: string[];
  actionItems?: string[];
  emotionalState?: string;
  additionalContext?: string;

  // Extended fields for flexibility - therapists can use any combination
  category?: NoteCategory;
  tags?: string[];

  // Structured sections (optional - therapists can choose what to use)
  clinicalAssessment?: string;
  treatmentPlan?: string;
  riskAssessment?: string;
  progressTracking?: string;
  financialHistory?: string;
  sessionObjectives?: string[];
  interventionsUsed?: string[];
  clientResponse?: string;
  homeworkAssigned?: string[];
  followUpNeeded?: string[];

  // Completely flexible field for any custom content
  customSections?: Record<string, unknown>;
}

export interface ClientNote {
  id: number;
  userId: number;
  therapistId: number;
  sessionId?: number;
  title: string;
  content: ClientNoteContent;
  isConfidential: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  userId: number;
  sessionId?: number;
  title: string;
  content: ClientNoteContent;
  isConfidential?: boolean;
}

export interface UpdateNoteRequest {
  id: number;
  title?: string;
  content?: ClientNoteContent;
  isConfidential?: boolean;
}

// Template suggestions to help therapists but not constrain them
export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  category: NoteCategory;
  template: Partial<ClientNoteContent>;
}
