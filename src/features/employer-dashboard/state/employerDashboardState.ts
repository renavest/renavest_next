import { signal } from '@preact-signals/safe-react';

interface FinancialWellnessMetrics {
  enrollmentRate: number;
  avgSavingsRate: number;
  stressReduction: number;
  retentionIncrease: number;
}

interface SessionMetrics {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  sessionsThisMonth: number;
  creditsRemaining: number;
  sessionsByMonth: MonthlySessionData[];
}

interface MonthlySessionData {
  month: string;
  completed: number;
  allocated: number;
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
  loginFrequencyData: LoginFrequencyData[];
}

interface LoginFrequencyData {
  day: string;
  users: number;
}

interface FinancialGoalsMetrics {
  totalGoalsSet: number;
  goalsCompleted: number;
  goalProgressData: GoalProgressData[];
}

interface GoalProgressData {
  month: string;
  completed: number;
  total: number;
}

interface ProgramStats {
  totalEmployees: number;
  activeEmployees: number;
  employeesWithSessions: number;
  employeesCompletedAllSessions: number;
}

export const financialWellnessMetricsSignal = signal<FinancialWellnessMetrics>({
  enrollmentRate: 75,
  avgSavingsRate: 12,
  stressReduction: 35,
  retentionIncrease: 15,
});

export const sessionMetricsSignal = signal<SessionMetrics>({
  totalSessions: 2000,
  completedSessions: 1560,
  upcomingSessions: 145,
  sessionsThisMonth: 230,
  creditsRemaining: 800,
  sessionsByMonth: [
    { month: 'Jan', completed: 180, allocated: 200 },
    { month: 'Feb', completed: 195, allocated: 200 },
    { month: 'Mar', completed: 210, allocated: 200 },
    { month: 'Apr', completed: 195, allocated: 200 },
    { month: 'May', completed: 200, allocated: 200 },
  ],
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
  goalsCompleted: 140,
  goalProgressData: [
    { month: 'Jan', completed: 15, total: 60 },
    { month: 'Feb', completed: 22, total: 70 },
    { month: 'Mar', completed: 28, total: 80 },
    { month: 'Apr', completed: 35, total: 93 },
    { month: 'May', completed: 40, total: 102 },
  ],
});

export const programStatsSignal = signal<ProgramStats>({
  totalEmployees: 500,
  activeEmployees: 450,
  employeesWithSessions: 410,
  employeesCompletedAllSessions: 390,
});
