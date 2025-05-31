import { Client, UpcomingSession, TherapistStatistics } from '../types';

/**
 * Format currency values for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100); // Assuming amounts are in cents
}

/**
 * Calculate completion rate percentage
 */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Get client status color for UI
 */
export function getClientStatusColor(status: Client['status']): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'inactive':
      return 'text-gray-600 bg-gray-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Get session status color for UI
 */
export function getSessionStatusColor(status: UpcomingSession['status']): string {
  switch (status) {
    case 'confirmed':
      return 'text-green-600 bg-green-100';
    case 'scheduled':
      return 'text-blue-600 bg-blue-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Format session duration for display
 */
export function formatSessionDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Get upcoming sessions for a specific client
 */
export function getClientSessions(
  clientId: string,
  sessions: UpcomingSession[],
): UpcomingSession[] {
  return sessions.filter((session) => session.clientId === clientId);
}

/**
 * Calculate dashboard metrics from raw data
 */
export function calculateDashboardMetrics(
  clients: Client[],
  sessions: UpcomingSession[],
  statistics: TherapistStatistics,
) {
  const activeClients = clients.filter((client) => client.status === 'active').length;
  const pendingClients = clients.filter((client) => client.status === 'pending').length;

  const upcomingSessions = sessions.length;
  const confirmedSessions = sessions.filter((session) => session.status === 'confirmed').length;

  return {
    totalClients: clients.length,
    activeClients,
    pendingClients,
    upcomingSessions,
    confirmedSessions,
    completionRate: calculateCompletionRate(statistics.completedSessions, statistics.totalSessions),
  };
}
