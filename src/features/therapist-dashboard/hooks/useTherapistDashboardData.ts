'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

import {
  Client,
  UpcomingSession,
  TherapistStatistics,
} from '@/src/features/therapist-dashboard/types';

import { therapistPageLoadedSignal } from '../state/therapistDashboardState';
export function useTherapistDashboardData() {
  const { user, isLoaded } = useUser();
  const [clients, setClients] = useState<Client[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [statistics, setStatistics] = useState<TherapistStatistics>({
    totalSessions: 0,
    totalClients: 0,
    completedSessions: 0,
  });
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('Dashboard Data Hook - User:', user);
    console.log('Dashboard Data Hook - isLoaded:', isLoaded);

    if (!isLoaded || !user) {
      console.log('User not loaded, skipping data fetch');
      return;
    }

    // Fetch data when user is loaded
    const fetchData = async () => {
      try {
        setError(null);

        // Use fetch with error handling
        const fetchWithErrorHandling = async (url: string) => {
          console.log(`Fetching data from: ${url}`);
          const response = await fetch(url);
          if (!response.ok) {
            const errorData = await response.json();
            console.error(`Error fetching from ${url}:`, errorData);
            throw new Error(errorData.error || `Failed to fetch data from ${url}`);
          }
          return response.json();
        };

        // Fetch all data in parallel
        const [clientsResponse, sessionsResponse, statisticsResponse] = await Promise.all([
          fetchWithErrorHandling('/api/therapist/clients'),
          fetchWithErrorHandling('/api/therapist/sessions'),
          fetchWithErrorHandling('/api/therapist/statistics'),
        ]);

        console.log('Clients Response:', clientsResponse);
        console.log('Sessions Response:', sessionsResponse);
        console.log('Statistics Response:', statisticsResponse);

        // Validate responses
        const processedClients = clientsResponse.clients || [];
        const processedSessions = sessionsResponse.sessions || [];
        const processedStatistics = statisticsResponse.statistics || {
          totalSessions: 0,
          totalClients: 0,
          completedSessions: 0,
        };

        console.log('Processed Data:', {
          clientsCount: processedClients.length,
          sessionsCount: processedSessions.length,
          statistics: processedStatistics,
        });

        // Update state with fetched data
        setClients(processedClients);
        setUpcomingSessions(processedSessions);
        setStatistics(processedStatistics);

        // Additional logging for debugging
        if (processedClients.length === 0) {
          console.warn('No clients found in the response');
        }
      } catch (err) {
        console.error('Error fetching therapist dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));

        // Reset to default states
        setClients([]);
        setUpcomingSessions([]);
        setStatistics({
          totalSessions: 0,
          totalClients: 0,
          completedSessions: 0,
        });
      } finally {
        therapistPageLoadedSignal.value = true;
      }
    };

    fetchData();
  }, [user, isLoaded]);

  return {
    clients,
    upcomingSessions,
    statistics,
    error,
  };
}
