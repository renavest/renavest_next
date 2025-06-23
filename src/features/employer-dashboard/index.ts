/**
 * Employer Dashboard Feature Exports
 *
 * This file exports all components, types, state, and utilities
 * for the employer dashboard feature.
 */

// =====================================
// Type Exports
// =====================================
export type {
  // Core Types
  SponsoredGroup,
  CreditRequest,
  EncouragementMessage,

  // Metrics Types
  FinancialWellnessMetrics,
  SessionMetrics,
  MonthlySessionData,
  EmployeeMetrics,
  SatisfactionMetrics,
  EngagementMetrics,
  LoginFrequencyData,
  FinancialGoalsMetrics,
  GoalProgressData,
  ProgramStats,
  TherapistMetrics,
  BookingMetrics,
  TherapistBookingData,

  // Component Props
  SponsoredGroupCardProps,
  SponsoredGroupsSectionProps,
  CreditRequestsModalProps,
  ProgramOverviewSectionProps,
  EmployeeInsightsCardProps,
  SessionAllocationChartProps,
  EngagementChartProps,
  SessionsSectionProps,
  EngagementSectionProps,
  ChartsSectionsProps,
  EmployerNavbarProps,
  NavigationItem,

  // Utility Types
  GroupType,
  EntityStatus,
  TimePeriod,
  ChartColorScheme,
} from './types';

// =====================================
// Component Exports
// =====================================

// Main Components
export { default as EmployerNavbar } from './components/EmployerNavbar';
export { SponsoredGroupCard } from './components/SponsoredGroupCard';
export { SponsoredGroupsSection } from './components/SponsoredGroupsSection';

// Chart Components
export { default as SessionAllocationChart } from './components/SessionAllocationChart';
export { default as EngagementChart } from './components/EngagementChart';

// Insight Components
export { default as EmployeeInsightsCard } from './components/EmployeeInsightsCard';

// Modal Components
export { default as CreditRequestsModal } from './components/CreditRequestsModal';

// Note: The following components may need to be updated with proper exports:
// - ProgramOverviewSection
// - ChartsSections
// - SessionsSection
// - EngagementSection

// Utility Components
export {
  getGroupTypeColor,
  getGroupTypeIcon,
  getProgressBarStyle,
  getEncouragementMessage,
} from './components/SponsoredGroupUtils';

// =====================================
// State Exports
// =====================================
export {
  financialWellnessMetricsSignal,
  sessionMetricsSignal,
  employeeMetricsSignal,
  satisfactionMetricsSignal,
  engagementMetricsSignal,
  financialGoalsMetricsSignal,
  programStatsSignal,
  therapistMetricsSignal,
  bookingMetricsSignal,
} from './state/employerDashboardState';

// =====================================
// Feature Constants
// =====================================
export const EMPLOYER_DASHBOARD_FEATURE = {
  name: 'employer-dashboard',
  version: '1.0.0',
  description:
    'Comprehensive employer dashboard for managing sponsored employee groups and tracking program metrics',
  dependencies: ['@clerk/nextjs', 'lucide-react', '@preact-signals/safe-react'],
} as const;

// =====================================
// Default Export (Main Dashboard Component)
// =====================================
// Note: Add when main dashboard component is created
// export { default } from './components/EmployerDashboard';
