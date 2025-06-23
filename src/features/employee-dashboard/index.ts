// Employee Dashboard Feature Exports

// Main Components
export { default as EmployeeDashboard } from './components/EmployeeDashboard';
export { DashboardContent } from './components/DashboardContent';
export { default as LimitedDashboardClient } from './components/LimitedDashboardClient';
export { default as EmployeeNavbar } from './components/EmployeeNavbar';

// Core Sections
export { default as ChatSection } from './components/ChatSection';
export { SharedDocumentsSection } from './components/SharedDocumentsSection';
export { UpcomingSessionsSection } from './components/UpcomingSessionsSection';
export { CurrentPlanCard } from './components/CurrentPlanCard';
export { SubscriptionPlanIndicator } from './components/SubscriptionPlanIndicator';

// Interactive Components
export { QuizModal } from './components/QuizModal';
export { default as FinancialTherapyModal } from './components/FinancialTherapyModal';
export { default as SharePanel } from './components/SharePanel';
export { default as VideoLibrary } from './components/VideoLibrary';
export { default as ConsultationBanner } from './components/ConsultationBanner';
export { default as TherapistRecommendationsWithOverlay } from './components/TherapistRecommendationsWithOverlay';

// Insights Components
export { default as TherapistRecommendations } from './components/insights/TherapistRecommendations';
export { default as PersonalActionableInsights } from './components/insights/PersonalActionableInsights';
export { default as PersonalGoalsTracker } from './components/insights/PersonalGoalsTracker';
export { default as ProgressComparisonChart } from './components/insights/ProgressComparisonChart';

// Forms Components
export { ClientFormsDashboard } from './components/forms/ClientFormsDashboard';
export { ClientFormFill } from './components/forms/ClientFormFill';
export { ClientFormFieldComponent as ClientFormField } from './components/forms/ClientFormField';

// State Management
export * from './state/dashboardState';
export {
  clientFormsStateSignal,
  clientFormsActions,
  getAssignmentsByStatus,
  getFormProgress,
  canSubmitForm,
} from './state/clientFormsState';

// Types
export type {
  Therapist,
  Message,
  Channel,
  TherapistRecommendationsProps,
  TherapistRecommendationsWithOverlayProps,
  QuizModalProps,
  FinancialTherapyModalProps,
  ConsultationBannerProps,
  SharePanelProps,
  DashboardContentProps,
  LimitedDashboardClientProps,
  FinancialGoal,
  ActionableInsight,
  ComparisonDataPoint,
  ClientFormFieldProps,
  SubscriptionPlan,
  SubscriptionPlanIndicatorProps,
} from './types';
