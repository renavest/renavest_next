export interface TherapistStatistics {
  totalClients: number;
  activeClients: number;
  totalSessions: number;
  upcomingSessions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageSessionRating?: number;
  completionRate: number;
}

export interface DashboardMetrics {
  clientGrowth: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  sessionMetrics: {
    completed: number;
    scheduled: number;
    cancelled: number;
  };
  revenueMetrics: {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  isEnabled: boolean;
}
