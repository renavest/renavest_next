/**
 * Employer Dashboard Feature Types
 *
 * This file contains all TypeScript type definitions for the employer dashboard feature.
 * Types are organized by functional area for better maintainability.
 */

import { ReactNode } from 'react';

// =====================================
// Core Dashboard Types
// =====================================

/**
 * Sponsored group information managed by employer
 */
export interface SponsoredGroup {
  /** Unique identifier for the sponsored group */
  id: number | string;
  /** Display name of the sponsored group */
  name: string;
  /** Type/category of the sponsored group */
  groupType: string;
  /** Detailed description of the group purpose */
  description: string;
  /** Current number of active members */
  memberCount: number;
  /** Total session credits allocated to this group */
  allocatedSessionCredits: number;
  /** Remaining unused session credits */
  remainingSessionCredits: number;
  /** Whether the group is currently active */
  isActive: boolean;
  /** When the group was created */
  createdAt: string;
  /** Total number of employees in organization */
  totalEmployees?: number;
  /** Number of active employees using platform */
  activeEmployees?: number;
  /** Total sessions conducted */
  totalSessions?: number;
  /** Monthly budget allocated */
  monthlyBudget?: number;
  /** Amount of budget currently used */
  usedBudget?: number;
  /** Current status of the group */
  status?: 'active' | 'inactive' | 'paused';
}

/**
 * Props for sponsored group card component
 */
export interface SponsoredGroupCardProps {
  /** The sponsored group to display */
  group: SponsoredGroup;
  /** Callback when user wants to edit group */
  onEdit?: (group: SponsoredGroup) => void;
  /** Callback when user wants to view group details */
  onViewDetails?: (group: SponsoredGroup) => void;
}

/**
 * Props for sponsored groups section component
 */
export interface SponsoredGroupsSectionProps {
  /** List of sponsored groups to display */
  groups?: SponsoredGroup[];
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Callback when user wants to create new group */
  onCreateGroup?: () => void;
}

/**
 * Props for credit requests modal
 */
export interface CreditRequestsModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Optional list of pending credit requests */
  creditRequests?: CreditRequest[];
}

/**
 * Individual credit request from employee
 */
export interface CreditRequest {
  /** Unique request identifier */
  id: string;
  /** Employee making the request */
  employeeId: string;
  /** Employee name for display */
  employeeName: string;
  /** Number of additional credits requested */
  creditsRequested: number;
  /** Reason provided for the request */
  reason: string;
  /** Current status of the request */
  status: 'pending' | 'approved' | 'rejected';
  /** When the request was submitted */
  requestedAt: string;
  /** When the request was processed (if applicable) */
  processedAt?: string;
}

/**
 * Encouragement message for group engagement
 */
export interface EncouragementMessage {
  /** Unique message identifier */
  id: string;
  /** The encouragement message text */
  message: string;
  /** Type of encouragement */
  type: 'motivation' | 'reminder' | 'celebration';
  /** Category this message applies to */
  category: 'engagement' | 'wellness' | 'financial';
  /** CSS classes for styling the message */
  className?: string;
}

// =====================================
// Metrics and Analytics Types
// =====================================

/**
 * Financial wellness program metrics
 */
export interface FinancialWellnessMetrics {
  /** Percentage of employees enrolled in program */
  enrollmentRate: number;
  /** Average savings rate across employees */
  avgSavingsRate: number;
  /** Reported stress reduction percentage */
  stressReduction: number;
  /** Employee retention increase percentage */
  retentionIncrease: number;
}

/**
 * Session-related metrics and utilization
 */
export interface SessionMetrics {
  /** Average credits allocated per employee */
  creditsPerEmployee: number;
  /** Total sessions allocated across all employees */
  totalSessionsAllocated: number;
  /** Number of completed sessions */
  completedSessions: number;
  /** Number of upcoming scheduled sessions */
  upcomingSessions: number;
  /** Sessions completed this month */
  sessionsThisMonth: number;
  /** Number of employees requesting credit top-ups */
  employeesRequestingTopUp: number;
  /** Historical session data by month */
  sessionsByMonth: MonthlySessionData[];
}

/**
 * Monthly session data point
 */
export interface MonthlySessionData {
  /** Month label (e.g., 'Jan', 'Feb') */
  month: string;
  /** Number of completed sessions in this month */
  completed: number;
  /** Number of allocated sessions in this month */
  allocated: number;
}

/**
 * Employee engagement and participation metrics
 */
export interface EmployeeMetrics {
  /** Total number of employees in organization */
  totalEmployees: number;
  /** Number of employees active in program */
  activeInProgram: number;
  /** Percentage of workforce under 35 */
  youngWorkforce: number;
  /** Coach/therapist utilization rate */
  coachUtilization: number;
}

/**
 * Employee satisfaction survey metrics
 */
export interface SatisfactionMetrics {
  /** Overall satisfaction rating (0-100) */
  overallSatisfaction: number;
  /** Stress reduction rating (0-100) */
  stressReduction: number;
  /** Financial confidence improvement (0-100) */
  financialConfidence: number;
  /** Likelihood to recommend rate (0-100) */
  recommendationRate: number;
}

/**
 * Platform engagement metrics
 */
export interface EngagementMetrics {
  /** Daily active users count */
  dailyActiveUsers: number;
  /** Weekly active users count */
  weeklyActiveUsers: number;
  /** Monthly active users count */
  monthlyActiveUsers: number;
  /** Login frequency data by day */
  loginFrequencyData: LoginFrequencyData[];
}

/**
 * Login frequency data point
 */
export interface LoginFrequencyData {
  /** Day label (e.g., 'Mon', 'Tue') */
  day: string;
  /** Number of users who logged in this day */
  users: number;
}

/**
 * Financial goals tracking metrics
 */
export interface FinancialGoalsMetrics {
  /** Total number of goals set by employees */
  totalGoalsSet: number;
  /** Number of goals that have been completed */
  goalsCompleted: number;
  /** Goal completion progress by month */
  goalProgressData: GoalProgressData[];
}

/**
 * Goal progress data point
 */
export interface GoalProgressData {
  /** Month label */
  month: string;
  /** Goals completed in this month */
  completed: number;
  /** Total goals set by this month */
  total: number;
}

/**
 * High-level program statistics
 */
export interface ProgramStats {
  /** Total employees in organization */
  totalEmployees: number;
  /** Currently active employees */
  activeEmployees: number;
  /** Employees who have booked sessions */
  employeesWithSessions: number;
  /** Employees who completed all allocated sessions */
  employeesCompletedAllSessions: number;
}

/**
 * Therapist workforce metrics
 */
export interface TherapistMetrics {
  /** Total therapists in network */
  totalTherapists: number;
  /** Currently active therapists */
  activeTherapists: number;
  /** Average sessions per therapist */
  averageSessionsPerTherapist: number;
  /** Therapist utilization rate percentage */
  therapistUtilizationRate: number;
}

/**
 * Booking and appointment metrics
 */
export interface BookingMetrics {
  /** Total bookings made */
  totalBookings: number;
  /** Currently scheduled bookings */
  scheduledBookings: number;
  /** Completed bookings count */
  completedBookings: number;
  /** Canceled bookings count */
  canceledBookings: number;
  /** Average bookings per employee */
  averageBookingsPerEmployee: number;
  /** Booking distribution by therapist */
  bookingsByTherapist: TherapistBookingData[];
}

/**
 * Therapist-specific booking data
 */
export interface TherapistBookingData {
  /** Unique therapist identifier */
  therapistId: number;
  /** Therapist full name */
  therapistName: string;
  /** Total bookings with this therapist */
  totalBookings: number;
  /** Completed bookings count */
  completedBookings: number;
  /** Upcoming bookings count */
  upcomingBookings: number;
}

// =====================================
// Component Props Types
// =====================================

/**
 * Props for program overview section
 */
export interface ProgramOverviewSectionProps {
  /** Program statistics to display */
  stats?: ProgramStats;
  /** Whether data is loading */
  isLoading?: boolean;
}

/**
 * Props for employee insights card
 */
export interface EmployeeInsightsCardProps {
  /** Employee metrics data */
  metrics?: EmployeeMetrics;
  /** Whether to show detailed breakdown */
  showDetails?: boolean;
}

/**
 * Props for session allocation chart
 */
export interface SessionAllocationChartProps {
  /** Session metrics for the chart */
  data?: SessionMetrics;
  /** Chart height in pixels */
  height?: number;
  /** Chart color scheme */
  colorScheme?: 'purple' | 'blue' | 'green';
}

/**
 * Props for engagement chart component
 */
export interface EngagementChartProps {
  /** Engagement data to visualize */
  data?: EngagementMetrics;
  /** Time period for the chart */
  period?: 'daily' | 'weekly' | 'monthly';
}

/**
 * Props for sessions section component
 */
export interface SessionsSectionProps {
  /** Session metrics to display */
  metrics?: SessionMetrics;
  /** Callback when user wants to manage credits */
  onManageCredits?: () => void;
}

/**
 * Props for engagement section component
 */
export interface EngagementSectionProps {
  /** Engagement metrics to display */
  metrics?: EngagementMetrics;
  /** Optional custom title */
  title?: string;
}

/**
 * Props for charts sections wrapper
 */
export interface ChartsSectionsProps {
  /** Child chart components */
  children?: ReactNode;
  /** Whether charts are in loading state */
  isLoading?: boolean;
}

/**
 * Props for employer navbar component
 */
export interface EmployerNavbarProps {
  /** Optional custom navigation items */
  customNavItems?: NavigationItem[];
  /** Whether to show company branding */
  showCompanyBranding?: boolean;
}

/**
 * Navigation item definition
 */
export interface NavigationItem {
  /** Navigation link href */
  href: string;
  /** Icon component to render */
  icon: React.ComponentType<{ className?: string }>;
  /** Label text for the nav item */
  label: string;
  /** Whether this item is currently active */
  isActive?: boolean;
}

// =====================================
// Utility Types
// =====================================

/**
 * Group type for styling and categorization
 */
export type GroupType = 'department' | 'team' | 'project' | 'division' | 'subsidiary' | 'custom';

/**
 * Status options for various entities
 */
export type EntityStatus = 'active' | 'inactive' | 'paused' | 'pending';

/**
 * Time period options for metrics
 */
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Chart color scheme options
 */
export type ChartColorScheme = 'purple' | 'blue' | 'green' | 'orange' | 'red';
