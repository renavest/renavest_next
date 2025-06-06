// Re-export all types from organized files
export * from './client';
export * from './session';
export * from './availability';
export * from './dashboard';
export * from './profile';
export * from './components';

// Import specific types for use in interfaces below
import type { ClientNoteContent, NoteCategory } from './client';

// Additional dashboard-specific types that don't fit in other categories
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
