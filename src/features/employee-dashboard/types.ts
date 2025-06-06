// Employee Dashboard Types

// Therapist related types
export interface Therapist {
  id: number;
  name: string;
  title: string;
  profileUrl: string;
  previewBlurb: string;
  bookingURL?: string;
  isPending?: boolean;
}

// Chat related types
export interface Message {
  id: number;
  messageId: string;
  senderId: number;
  content: string;
  messageType: string;
  status: string;
  sentAt: string;
  senderFirstName: string;
  senderLastName: string;
  senderEmail: string;
}

export interface Channel {
  id: number;
  channelIdentifier: string;
  therapistId: number;
  prospectUserId: number;
  status: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  therapistName?: string;
  therapistTitle?: string;
  prospectFirstName?: string;
  prospectLastName?: string;
  prospectEmail?: string;
}

// Component Props Types
export interface TherapistRecommendationsProps {
  showViewAllButton?: boolean;
}

export interface TherapistRecommendationsWithOverlayProps {
  children: React.ReactNode;
}

export interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answers: Record<string, string>) => void;
}

export interface FinancialTherapyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ConsultationBannerProps {
  onBookConsultation: () => void;
}

export interface SharePanelProps {
  referralCode: string;
}
