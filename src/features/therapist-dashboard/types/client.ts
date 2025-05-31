export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  lastSessionDate?: string;
  totalSessions: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface ClientSession {
  id: string;
  clientId: string;
  sessionDate: string;
  duration: number;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  sessionType: 'initial' | 'follow-up' | 'emergency';
}

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
