// Explore Feature Types

// Re-export the shared Advisor type to ensure compatibility
export type { Advisor } from '@/src/shared/types';

/**
 * Props for the main advisor card component in the grid
 */
export interface AdvisorCardProps {
  advisor: import('@/src/shared/types').Advisor;
  priority: boolean; // For image loading priority
}

/**
 * Props for the advisor grid container component
 */
export interface AdvisorGridProps {
  advisors: import('@/src/shared/types').Advisor[];
}

/**
 * Props for the detailed advisor modal
 */
export interface AdvisorModalProps {
  advisor: import('@/src/shared/types').Advisor | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Image loading state for individual advisors
 */
export interface ImageLoadState {
  isLoaded: boolean;
  hasError: boolean;
  isLoading: boolean;
}

/**
 * Navigation bar props for explore pages
 */
export interface ExploreNavbarProps {
  pageTitle?: string;
  showBackButton?: boolean;
  additionalActions?: React.ReactNode;
}

/**
 * Marketplace integration status for advisors
 */
export interface MarketplaceIntegration {
  isConnected: boolean | null;
  isChecking: boolean;
  error: string | null;
  bookingMode: 'internal' | 'external' | null;
}

/**
 * State management types for advisor signals
 */
export interface AdvisorState {
  selectedAdvisor: import('@/src/shared/types').Advisor | null;
  isModalOpen: boolean;
  advisorsList: import('@/src/shared/types').Advisor[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Image loading states for all advisors
 */
export interface AdvisorImageStates {
  loading: Record<string, boolean>;
  errors: Record<string, boolean>;
}

/**
 * Booking flow state
 */
export interface BookingState {
  isActive: boolean;
  mode: 'internal' | 'external' | null;
  targetAdvisorId: string | null;
}

/**
 * Action types for advisor state management
 */
export interface AdvisorActions {
  setAdvisors: (advisors: import('@/src/shared/types').Advisor[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openAdvisorModal: (advisor: import('@/src/shared/types').Advisor) => void;
  closeAdvisorModal: () => void;
  setImageLoading: (advisorId: string, loading: boolean) => void;
  setImageError: (advisorId: string, hasError: boolean) => void;
}

/**
 * Types for expertise tag rendering
 */
export interface ExpertiseTag {
  text: string;
  index: number;
  isOverflow?: boolean;
  overflowCount?: number;
}
