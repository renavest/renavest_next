// Employer Dashboard Types

export interface SponsoredGroup {
  id: string;
  name: string;
  totalEmployees: number;
  activeEmployees: number;
  totalSessions: number;
  monthlyBudget: number;
  usedBudget: number;
  status: 'active' | 'inactive' | 'paused';
  createdAt: string;
}

export interface SponsoredGroupCardProps {
  group: SponsoredGroup;
  onEdit: (group: SponsoredGroup) => void;
  onViewDetails: (group: SponsoredGroup) => void;
}

export interface CreditRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface EncouragementMessage {
  id: string;
  message: string;
  type: 'motivation' | 'reminder' | 'celebration';
  category: 'engagement' | 'wellness' | 'financial';
}
