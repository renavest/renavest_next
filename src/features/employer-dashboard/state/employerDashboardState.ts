import { signal } from '@preact-signals/safe-react';

interface FinancialWellnessMetrics {
  enrollmentRate: number;
  avgSavingsRate: number;
  stressReduction: number;
  retentionIncrease: number;
}

interface SessionMetrics {
  activeBookings: number;
  creditUtilization: number;
  stressTrackerUsage: number;
  completionRate: number;
  avgSessionsPerEmployee: number;
}

interface EmployeeMetrics {
  totalEmployees: number;
  activeInProgram: number;
  youngWorkforce: number;
  coachUtilization: number;
}

interface SatisfactionMetrics {
  overallSatisfaction: number;
  stressReduction: number;
  financialConfidence: number;
  recommendationRate: number;
}

interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionsPerWeek: number;
  loginFrequencyData: LoginFrequencyData[];
}

interface LoginFrequencyData {
  day: string;
  users: number;
}

interface FinancialGoalsMetrics {
  totalGoalsSet: number;
  goalsInProgress: number;
  goalsAchieved: number;
  avgProgressPercentage: number;
  goalProgressData: GoalProgressData[];
}

interface GoalProgressData {
  month: string;
  achieved: number;
  inProgress: number;
}

interface ProgramStats {
  totalEmployees: number;
  activeUsers: number;
  programROI: number;
  satisfactionScore: number;
}

export const financialWellnessMetricsSignal = signal<FinancialWellnessMetrics>({
  enrollmentRate: 75,
  avgSavingsRate: 12,
  stressReduction: 35,
  retentionIncrease: 15,
});

export const sessionMetricsSignal = signal<SessionMetrics>({
  activeBookings: 45,
  creditUtilization: 68,
  stressTrackerUsage: 72,
  completionRate: 85,
  avgSessionsPerEmployee: 2.8,
});

export const employeeMetricsSignal = signal<EmployeeMetrics>({
  totalEmployees: 150,
  activeInProgram: 120,
  youngWorkforce: 65,
  coachUtilization: 45,
});

export const satisfactionMetricsSignal = signal<SatisfactionMetrics>({
  overallSatisfaction: 92,
  stressReduction: 78,
  financialConfidence: 85,
  recommendationRate: 89,
});

export const engagementMetricsSignal = signal<EngagementMetrics>({
  dailyActiveUsers: 85,
  weeklyActiveUsers: 320,
  monthlyActiveUsers: 450,
  averageSessionsPerWeek: 2.3,
  loginFrequencyData: [
    { day: 'Mon', users: 85 },
    { day: 'Tue', users: 92 },
    { day: 'Wed', users: 88 },
    { day: 'Thu', users: 78 },
    { day: 'Fri', users: 65 },
    { day: 'Sat', users: 25 },
    { day: 'Sun', users: 30 },
  ],
});

export const financialGoalsMetricsSignal = signal<FinancialGoalsMetrics>({
  totalGoalsSet: 520,
  goalsInProgress: 380,
  goalsAchieved: 140,
  avgProgressPercentage: 45,
  goalProgressData: [
    { month: 'Jan', achieved: 15, inProgress: 45 },
    { month: 'Feb', achieved: 22, inProgress: 48 },
    { month: 'Mar', achieved: 28, inProgress: 52 },
    { month: 'Apr', achieved: 35, inProgress: 58 },
    { month: 'May', achieved: 40, inProgress: 62 },
  ],
});

export const programStatsSignal = signal<ProgramStats>({
  totalEmployees: 500,
  activeUsers: 450,
  programROI: 2.5,
  satisfactionScore: 82,
});
