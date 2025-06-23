// Employee Dashboard Feature Exports

// Main Layout Components
export { default as EmployeeDashboard } from './components/layout/EmployeeDashboard';
export { DashboardContent } from './components/layout/DashboardContent';
export { default as LimitedDashboardClient } from './components/layout/LimitedDashboardClient';
export { default as EmployeeNavbar } from './components/layout/EmployeeNavbar';

// Dashboard Sections
export { default as ChatSection } from './components/sections/ChatSection';
export { SharedDocumentsSection } from './components/sections/SharedDocumentsSection';
export { UpcomingSessionsSection } from './components/sections/UpcomingSessionsSection';
export { default as SharePanel } from './components/sections/SharePanel';
export { default as VideoLibrary } from './components/sections/VideoLibrary';
export { default as ConsultationBanner } from './components/sections/ConsultationBanner';
export { default as ComingSoon } from './components/sections/ComingSoon';

// Subscription Components
export { CurrentPlanCard } from './components/subscription/CurrentPlanCard';
export { SubscriptionPlanIndicator } from './components/subscription/SubscriptionPlanIndicator';

// Interactive Modals
export { QuizModal } from './components/modals/QuizModal';
export { default as FinancialTherapyModal } from './components/modals/FinancialTherapyModal';

// Insights Components
export { default as TherapistRecommendations } from './components/insights/TherapistRecommendations';
export { default as PersonalActionableInsights } from './components/insights/PersonalActionableInsights';
export { default as PersonalGoalsTracker } from './components/insights/PersonalGoalsTracker';
export { default as ProgressComparisonChart } from './components/insights/ProgressComparisonChart';
export { default as TherapistRecommendationsWithOverlay } from './components/insights/TherapistRecommendationsWithOverlay';

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
