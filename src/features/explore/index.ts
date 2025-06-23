/**
 * Explore Feature - Centralized Exports
 *
 * This file provides a single entry point for all explore feature exports,
 * making it easy to import components, hooks, and utilities from other parts of the application.
 */

// Core Components
export { default as AdvisorGrid } from './components/AdvisorGrid';
export { default as AdvisorModal } from './components/AdvisorModal';
export { default as ExploreNavbar } from './components/ExploreNavbar';

// State Management
export * from './state/exploreState';

// Custom Hooks
export { useMarketplaceIntegration } from './hooks/useMarketplaceIntegration';
export { useImageLoadState } from './hooks/useImageLoadState';

// Utilities
export * from './utils/expertiseUtils';
export * from './utils/bookingUtils';

// Types
export type {
  Advisor,
  AdvisorCardProps,
  AdvisorGridProps,
  AdvisorModalProps,
  ImageLoadState,
  ExploreNavbarProps,
  MarketplaceIntegration,
  AdvisorState,
  AdvisorImageStates,
  BookingState,
  AdvisorActions,
  ExpertiseTag,
} from './types';

// Re-export commonly used actions for convenience
export { advisorActions } from './state/exploreState';
