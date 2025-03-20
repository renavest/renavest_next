import { signal } from '@preact-signals/safe-react';

export interface HSAMetrics {
  totalContributions: number;
  averageContribution: number;
  participationRate: number;
  yearOverYearGrowth: number;
}

export interface EmployeeMetrics {
  totalEmployees: number;
  activeInProgram: number;
  averageEngagement: number;
  therapistUtilization: number;
}

export interface ProgramStats {
  totalHSASpend: number;
  averageEmployeeBalance: number;
  programROI: number;
  wellnessScore: number;
}

// Sample data for now
export const hsaMetricsSignal = signal<HSAMetrics>({
  totalContributions: 250000,
  averageContribution: 2500,
  participationRate: 75,
  yearOverYearGrowth: 15,
});

export const employeeMetricsSignal = signal<EmployeeMetrics>({
  totalEmployees: 150,
  activeInProgram: 120,
  averageEngagement: 85,
  therapistUtilization: 65,
});

export const programStatsSignal = signal<ProgramStats>({
  totalHSASpend: 375000,
  averageEmployeeBalance: 3200,
  programROI: 2.5,
  wellnessScore: 82,
});
