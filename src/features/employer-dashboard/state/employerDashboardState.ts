import { signal } from '@preact-signals/safe-react';

interface FinancialWellnessMetrics {
  enrollmentRate: number;
  avgSavingsRate: number;
  stressReduction: number;
  retentionIncrease: number;
}

interface SessionMetrics {
  creditsPerEmployee: number;
  totalSessionsAllocated: number;
  completedSessions: number;
  upcomingSessions: number;
  sessionsThisMonth: number;
  employeesRequestingTopUp: number;
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

interface TherapistMetrics {
  totalTherapists: number;
  activeTherapists: number;
  averageSessionsPerTherapist: number;
  therapistUtilizationRate: number;
}

interface BookingMetrics {
  totalBookings: number;
  scheduledBookings: number;
  completedBookings: number;
  canceledBookings: number;
  averageBookingsPerEmployee: number;
  bookingsByTherapist: TherapistBookingData[];
}

interface TherapistBookingData {
  therapistId: number;
  therapistName: string;
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
}

const financialWellnessMetricsSignal = signal<FinancialWellnessMetrics>({
  enrollmentRate: 87,
  avgSavingsRate: 18,
  stressReduction: 42,
  retentionIncrease: 23,
});

export const sessionMetricsSignal = signal<SessionMetrics>({
  creditsPerEmployee: 600,
  totalSessionsAllocated: 3200,
  completedSessions: 2840,
  upcomingSessions: 245,
  sessionsThisMonth: 420,
  employeesRequestingTopUp: 28,
  sessionsByMonth: [
    { month: 'Aug', completed: 280, allocated: 320 },
    { month: 'Sep', completed: 310, allocated: 340 },
    { month: 'Oct', completed: 365, allocated: 380 },
    { month: 'Nov', completed: 420, allocated: 450 },
    { month: 'Dec', completed: 485, allocated: 500 },
    { month: 'Jan', completed: 520, allocated: 550 },
  ],
});

export const employeeMetricsSignal = signal<EmployeeMetrics>({
  totalEmployees: 750,
  activeInProgram: 650,
  youngWorkforce: 78,
  coachUtilization: 68,
});

const satisfactionMetricsSignal = signal<SatisfactionMetrics>({
  overallSatisfaction: 94,
  stressReduction: 81,
  financialConfidence: 89,
  recommendationRate: 92,
});

export const engagementMetricsSignal = signal<EngagementMetrics>({
  dailyActiveUsers: 185,
  weeklyActiveUsers: 580,
  monthlyActiveUsers: 720,
  loginFrequencyData: [
    { day: 'Mon', users: 185 },
    { day: 'Tue', users: 192 },
    { day: 'Wed', users: 178 },
    { day: 'Thu', users: 165 },
    { day: 'Fri', users: 142 },
    { day: 'Sat', users: 68 },
    { day: 'Sun', users: 75 },
  ],
});

const financialGoalsMetricsSignal = signal<FinancialGoalsMetrics>({
  totalGoalsSet: 890,
  goalsCompleted: 245,
  goalProgressData: [
    { month: 'Aug', completed: 28, total: 85 },
    { month: 'Sep', completed: 42, total: 120 },
    { month: 'Oct', completed: 58, total: 150 },
    { month: 'Nov', completed: 78, total: 185 },
    { month: 'Dec', completed: 96, total: 220 },
    { month: 'Jan', completed: 118, total: 265 },
  ],
});

export const programStatsSignal = signal<ProgramStats>({
  totalEmployees: 750,
  activeEmployees: 680,
  employeesWithSessions: 620,
  employeesCompletedAllSessions: 580,
});

const therapistMetricsSignal = signal<TherapistMetrics>({
  totalTherapists: 38,
  activeTherapists: 32,
  averageSessionsPerTherapist: 24,
  therapistUtilizationRate: 85,
});

const bookingMetricsSignal = signal<BookingMetrics>({
  totalBookings: 2890,
  scheduledBookings: 2640,
  completedBookings: 2420,
  canceledBookings: 125,
  averageBookingsPerEmployee: 4.2,
  bookingsByTherapist: [
    {
      therapistId: 1,
      therapistName: 'Dr. Emily Chen',
      totalBookings: 485,
      completedBookings: 445,
      upcomingBookings: 40,
    },
    {
      therapistId: 2,
      therapistName: 'Dr. Michael Rodriguez',
      totalBookings: 420,
      completedBookings: 385,
      upcomingBookings: 35,
    },
    {
      therapistId: 3,
      therapistName: 'Dr. Sarah Johnson',
      totalBookings: 395,
      completedBookings: 365,
      upcomingBookings: 30,
    },
    {
      therapistId: 4,
      therapistName: 'Dr. David Kim',
      totalBookings: 380,
      completedBookings: 350,
      upcomingBookings: 30,
    },
  ],
});
