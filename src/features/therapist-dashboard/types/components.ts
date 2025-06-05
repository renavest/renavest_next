// Therapist Dashboard Component Props Types

export interface TherapistDashboardPageProps {
  therapistId: number;
}

export interface PhotoUploadProps {
  currentImageUrl?: string;
  onUploadSuccess: (imageUrl: string) => void;
  onUploadError: (error: string) => void;
}

export interface ProfileDisplayProps {
  therapistId: number;
  profile: any; // You may want to define a proper Profile type
  onEdit: () => void;
}

export interface ProfileFormFieldsProps {
  initialData: any; // You may want to define a proper Profile type
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export interface TherapistImageProps {
  profileUrl?: string;
  name: string;
  width?: number;
  height?: number;
  className?: string;
}

export interface DocumentUploadProps {
  clientId?: string;
  sessionId?: string;
  onUploadSuccess: (document: any) => void;
  onUploadError: (error: string) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  description?: string;
}

export interface ClientAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentClientId?: string;
  onAssignmentChange: (clientId: string | null) => void;
}

export interface DocumentListProps {
  documents: any[];
  onDocumentSelect: (document: any) => void;
  onDocumentDelete: (documentId: string) => void;
  onDocumentDownload: (document: any) => void;
  loading?: boolean;
}

export interface AvailabilityManagementProps {
  therapistId: number;
}

export interface WorkingHoursViewProps {
  workingHours: any[];
  onUpdate: (hours: any[]) => void;
  loading?: boolean;
}

export interface BlockedTimeViewProps {
  blockedTimes: any[];
  onAdd: (blockedTime: any) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export interface OverviewViewProps {
  overview: any; // Define proper AvailabilityOverview type
  onRefresh: () => void;
  loading?: boolean;
}

export interface SessionCompletionCardProps {
  session: any; // Define proper Session type
  onComplete: (sessionId: string, notes?: string) => Promise<void>;
  onCancel: (sessionId: string) => Promise<void>;
}

export interface ClientNotesSectionProps {
  clientId: string;
  notes: any[];
  onNoteCreate: (note: any) => void;
  onNoteUpdate: (noteId: string, updates: any) => void;
  onNoteDelete: (noteId: string) => void;
  loading?: boolean;
}

export interface ClientNotesFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface NoteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: any;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}

export interface NotePreviewCardProps {
  note: any;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url: string;
  clientId: string;
  sessionId?: string;
}

export interface ClientDocumentsTabProps {
  clientId: string;
  documents: ClientDocument[];
  onDocumentUpload: (document: ClientDocument) => void;
  onDocumentDelete: (documentId: string) => void;
  loading?: boolean;
}

export interface AddNewClientSectionProps {
  onClientAdded: (client: any) => void;
}
