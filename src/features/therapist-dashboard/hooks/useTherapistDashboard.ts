import { useEffect, useCallback } from 'react';

import {
  trackTherapistDashboard,
  trackTherapistClientManagement,
  trackTherapistSessions,
} from '@/src/features/posthog/therapistTracking';

import {
  therapistIdSignal,
  therapistPageLoadedSignal,
  clientsSignal,
  upcomingSessionsSignal,
  statisticsSignal,
  dashboardLoadingSignal,
  dashboardErrorSignal,
  lastRefreshTimeSignal,
} from '../state/therapistDashboardState';

export function useTherapistDashboard(initialTherapistId?: number) {
  // Initialize therapist ID from props
  useEffect(() => {
    if (initialTherapistId) {
      therapistIdSignal.value = initialTherapistId;
      therapistPageLoadedSignal.value = true;

      // Track dashboard page view
      trackTherapistDashboard.pageViewed(initialTherapistId, {
        user_id: `therapist_${initialTherapistId}`,
      });
    }
  }, [initialTherapistId]);

  // Track client list viewed when clients change
  useEffect(() => {
    if (therapistIdSignal.value && clientsSignal.value.length > 0) {
      trackTherapistClientManagement.clientListViewed(
        therapistIdSignal.value,
        clientsSignal.value.length,
        { user_id: `therapist_${therapistIdSignal.value}` },
      );
    }
  }, [clientsSignal.value]);

  // Track sessions viewed when sessions change
  useEffect(() => {
    if (therapistIdSignal.value && upcomingSessionsSignal.value.length > 0) {
      trackTherapistSessions.sessionsViewed(
        therapistIdSignal.value,
        upcomingSessionsSignal.value.length,
        { user_id: `therapist_${therapistIdSignal.value}` },
      );
    }
  }, [upcomingSessionsSignal.value]);

  // Refresh data function using API calls
  const refreshData = useCallback(async () => {
    const therapistId = therapistIdSignal.value;
    if (!therapistId) return;

    try {
      dashboardLoadingSignal.value = true;
      dashboardErrorSignal.value = null;

      // Use API endpoints instead of direct database access
      const [clientsResponse, sessionsResponse, statsResponse] = await Promise.all([
        fetch('/api/therapist/clients'),
        fetch('/api/therapist/sessions'),
        fetch('/api/therapist/statistics'),
      ]);

      if (!clientsResponse.ok || !sessionsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [clientsData, sessionsData, statsData] = await Promise.all([
        clientsResponse.json(),
        sessionsResponse.json(),
        statsResponse.json(),
      ]);

      // Update signals with API data
      clientsSignal.value = clientsData.clients || [];
      upcomingSessionsSignal.value = sessionsData.sessions || [];
      statisticsSignal.value = statsData.statistics || {
        totalClients: 0,
        activeClients: 0,
        totalSessions: 0,
        upcomingSessions: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        completionRate: 0,
      };
      lastRefreshTimeSignal.value = new Date();

      console.log('Dashboard data refreshed from API');
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      dashboardErrorSignal.value = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      dashboardLoadingSignal.value = false;
    }
  }, []);

  // Individual data refresh functions using API calls
  const refreshClients = useCallback(async () => {
    const therapistId = therapistIdSignal.value;
    if (!therapistId) return;

    try {
      const response = await fetch('/api/therapist/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const clientsData = await response.json();
      clientsSignal.value = (clientsData.clients || []).map((client: any) => ({
        id: client.id.toString(),
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: undefined,
        createdAt: new Date().toISOString(),
        lastSessionDate: undefined,
        totalSessions: 0,
        status: 'active' as const,
      }));
      console.log('Clients refreshed from API');
    } catch (error) {
      console.error('Error refreshing clients:', error);
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    const therapistId = therapistIdSignal.value;
    if (!therapistId) return;

    try {
      const response = await fetch('/api/therapist/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const sessionsData = await response.json();
      upcomingSessionsSignal.value = (sessionsData.sessions || []).map((session: any) => ({
        id: session.id.toString(),
        clientId: session.clientId?.toString() ?? '',
        clientName: session.clientName,
        sessionDate: session.sessionDate,
        sessionTime: session.sessionStartTime,
        duration: 60,
        sessionType: 'follow-up' as const,
        status: session.status as 'scheduled' | 'confirmed' | 'pending',
        meetingLink: session.googleMeetLink,
      }));
      console.log('Sessions refreshed from API');
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    }
  }, []);

  // Data refresh functions
  const invalidateAndRefresh = useCallback(
    async (type: 'client' | 'session' | 'all' = 'all') => {
      // Simply refresh the requested data - no cache invalidation needed for API calls
      if (type === 'all') {
        await refreshData();
      } else if (type === 'client') {
        await refreshClients();
      } else if (type === 'session') {
        await refreshSessions();
      }
    },
    [refreshData, refreshClients, refreshSessions],
  );

  return {
    refreshData,
    refreshClients,
    refreshSessions,
    invalidateAndRefresh,
    isLoaded: therapistPageLoadedSignal.value,
    therapistId: therapistIdSignal.value,
    isLoading: dashboardLoadingSignal.value,
    error: dashboardErrorSignal.value,
    lastRefresh: lastRefreshTimeSignal.value,
  };
}
