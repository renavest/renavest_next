import { useEffect, useCallback } from 'react';

import {
  trackTherapistDashboard,
  trackTherapistClientManagement,
  trackTherapistSessions,
} from '@/src/features/posthog/therapistTracking';
import {
  getDashboardData,
  getClientsData,
  getSessionsData,
  invalidateOnDataChange,
} from '@/src/services/therapistDataService';

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

  // Optimized refresh data function using cached services
  const refreshData = useCallback(async () => {
    const therapistId = therapistIdSignal.value;
    if (!therapistId) return;

    try {
      dashboardLoadingSignal.value = true;
      dashboardErrorSignal.value = null;

      // Use cached dashboard data service for optimized performance
      const dashboardData = await getDashboardData(therapistId);

      // Update signals with cached data
      clientsSignal.value = dashboardData.clients;
      upcomingSessionsSignal.value = dashboardData.upcomingSessions;
      statisticsSignal.value = dashboardData.statistics;
      lastRefreshTimeSignal.value = new Date();

      console.log('Dashboard data refreshed from optimized cache');
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      dashboardErrorSignal.value = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      dashboardLoadingSignal.value = false;
    }
  }, []);

  // Optimized individual data refresh functions
  const refreshClients = useCallback(async () => {
    const therapistId = therapistIdSignal.value;
    if (!therapistId) return;

    try {
      const clientsData = await getClientsData(therapistId);
      clientsSignal.value = clientsData.clients.map((client) => ({
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
      console.log('Clients refreshed from cache');
    } catch (error) {
      console.error('Error refreshing clients:', error);
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    const therapistId = therapistIdSignal.value;
    if (!therapistId) return;

    try {
      const sessionsData = await getSessionsData(therapistId);
      upcomingSessionsSignal.value = sessionsData.sessions.map((session) => ({
        id: session.id.toString(),
        clientId: session.clientId?.toString() ?? '',
        clientName: session.clientName,
        sessionDate: session.sessionDate.toISOString(),
        sessionTime: session.sessionStartTime.toISOString(),
        duration: 60,
        sessionType: 'follow-up' as const,
        status: session.status as 'scheduled' | 'confirmed' | 'pending',
        meetingLink: session.googleMeetLink,
      }));
      console.log('Sessions refreshed from cache');
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    }
  }, []);

  // Cache invalidation functions
  const invalidateAndRefresh = useCallback(
    async (type: 'client' | 'session' | 'all' = 'all') => {
      const therapistId = therapistIdSignal.value;
      if (!therapistId) return;

      await invalidateOnDataChange(therapistId, type);

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
