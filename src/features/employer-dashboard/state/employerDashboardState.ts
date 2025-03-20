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

interface ProgramStats {
  costSavings: number;
  productivityGain: number;
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

export const programStatsSignal = signal<ProgramStats>({
  costSavings: 375000,
  productivityGain: 23,
  programROI: 2.5,
  satisfactionScore: 82,
});
