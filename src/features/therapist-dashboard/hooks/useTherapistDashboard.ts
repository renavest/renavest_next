import { useEffect, useCallback } from 'react';
import {
  therapistIdSignal,
  therapistPageLoadedSignal,
  clientsSignal,
  upcomingSessionsSignal,
  statisticsSignal,
} from '../state/therapistDashboardState';
import {
  trackTherapistDashboard,
  trackTherapistClientManagement,
  trackTherapistSessions,
} from '@/src/features/posthog/therapistTracking';

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

  // Function to refresh data from the server
  const refreshData = useCallback(async () => {
    if (!therapistIdSignal.value) return;

    try {
      // Fetch updated data
      const fetchWithErrorHandling = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${url}`);
        }
        return response.json();
      };

      // Fetch all data in parallel
      const [clientsResponse, sessionsResponse, statisticsResponse] = await Promise.all([
        fetchWithErrorHandling('/api/therapist/clients'),
        fetchWithErrorHandling('/api/therapist/sessions'),
        fetchWithErrorHandling('/api/therapist/statistics'),
      ]);

      // Update signals with fetched data
      clientsSignal.value = clientsResponse.clients || [];
      upcomingSessionsSignal.value = sessionsResponse.sessions || [];
      statisticsSignal.value = statisticsResponse.statistics || {
        totalSessions: 0,
        totalClients: 0,
        completedSessions: 0,
      };
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, []);

  return {
    refreshData,
    isLoaded: therapistPageLoadedSignal.value,
    therapistId: therapistIdSignal.value,
  };
}
