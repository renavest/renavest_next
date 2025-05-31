export interface TherapistDocument {
  id: string;
  s3Key: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  title: string;
  description?: string;
  category: string;
  uploadedAt: string;
  lastModified: string;
  assignments?: DocumentAssignment[];
}

export interface DocumentAssignment {
  userId: number;
  isSharedWithClient: boolean;
  sharedAt?: string;
  assignedAt: string;
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
    fullName: string;
  };
}

export interface DocumentUploadData {
  file: File;
  title: string;
  description?: string;
  category?: string;
}

export interface ClientInfo {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  fullName: string;
}

export interface ClientAssignment {
  clientId: string;
  clientName: string;
  assignedAt: string;
  viewedAt?: string;
  downloadedAt?: string;
  notes?: string;
  isActive: boolean;
}

export const DOCUMENT_CATEGORIES = [
  'general',
  'assessment',
  'treatment-plan',
  'worksheet',
  'educational',
  'intake-form',
  'resource',
  'template',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  general: 'General',
  assessment: 'Assessment',
  'treatment-plan': 'Treatment Plan',
  worksheet: 'Worksheet',
  educational: 'Educational Material',
  'intake-form': 'Intake Form',
  resource: 'Resource',
  template: 'Template',
};

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

export const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'text/plain': 'Text File',
  'image/jpeg': 'JPEG Image',
  'image/jpg': 'JPEG Image',
  'image/png': 'PNG Image',
  'image/webp': 'WebP Image',
};

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
