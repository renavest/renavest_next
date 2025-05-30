'use client';

import { UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';

import {
  trackTherapistDashboard,
  trackTherapistClientManagement,
  trackTherapistSessions,
} from '@/src/features/posthog/therapistTracking';
import { AddNewClientSection } from '@/src/features/therapist-dashboard/components/AddNewClientSection';
import { ClientNotesSection } from '@/src/features/therapist-dashboard/components/ClientNotesSection';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';
import { TherapistStatisticsCard } from '@/src/features/therapist-dashboard/components/TherapistStatisticsCard';
import { UpcomingSessionsCard } from '@/src/features/therapist-dashboard/components/UpcomingSessionsCard';
import {
  therapistIdSignal,
  therapistPageLoadedSignal,
  clientsSignal,
  upcomingSessionsSignal,
  statisticsSignal,
  selectedClientSignal,
  isAddClientOpenSignal,
} from '@/src/features/therapist-dashboard/state/therapistDashboardState';
import {
  Client,
  UpcomingSession,
  TherapistStatistics,
} from '@/src/features/therapist-dashboard/types';
import { COLORS } from '@/src/styles/colors';

const QuickActionsSection = () => {
  const [calendarIntegrated, setCalendarIntegrated] = useState<boolean>(false);

  // Check Google Calendar integration status
  useEffect(() => {
    const checkIntegration = async () => {
      if (!therapistIdSignal.value) return;

      try {
        const response = await fetch(
          `/api/google-calendar/status?therapistId=${therapistIdSignal.value}`,
        );
        const data = await response.json();
        setCalendarIntegrated(data.isConnected && data.integrationStatus === 'connected');
      } catch (error) {
        console.error('Error checking calendar integration:', error);
        setCalendarIntegrated(false);
      }
    };

    checkIntegration();
  }, [therapistIdSignal.value]);

  const handleProfileClick = () => {
    if (therapistIdSignal.value) {
      trackTherapistDashboard.quickActionClicked('view_profile', therapistIdSignal.value, {
        user_id: `therapist_${therapistIdSignal.value}`,
      });
    }
  };

  const handleIntegrationsClick = () => {
    if (therapistIdSignal.value) {
      trackTherapistDashboard.quickActionClicked('manage_integrations', therapistIdSignal.value, {
        user_id: `therapist_${therapistIdSignal.value}`,
      });
    }
  };

  const handleAvailabilityClick = () => {
    if (therapistIdSignal.value) {
      trackTherapistDashboard.quickActionClicked('manage_availability', therapistIdSignal.value, {
        user_id: `therapist_${therapistIdSignal.value}`,
      });
    }
  };

  return (
    <div className='mt-6'>
      <h2 className='text-xl font-semibold text-gray-800 mb-4'>Quick Actions</h2>
      <div
        className={`grid grid-cols-1 gap-4 ${calendarIntegrated ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
      >
        <Link
          href='/therapist/profile'
          onClick={handleProfileClick}
          className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group'
        >
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors'>
              <svg
                className='w-6 h-6 text-purple-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>View & Edit Profile</h3>
              <p className='text-gray-500 text-sm'>Manage your professional information</p>
            </div>
          </div>
        </Link>
        <Link
          href='/therapist/integrations'
          onClick={handleIntegrationsClick}
          className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group'
        >
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors'>
              <svg
                className='w-6 h-6 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
                />
              </svg>
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>Manage Integrations</h3>
              <p className='text-gray-500 text-sm'>
                {calendarIntegrated
                  ? 'Connect your bank account, calendar, and other tools'
                  : 'Connect your Google Calendar to manage availability'}
              </p>
            </div>
          </div>
        </Link>
        {/* Only show availability card if Google Calendar is connected */}
        {calendarIntegrated && (
          <Link
            href='/therapist/availability'
            onClick={handleAvailabilityClick}
            className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group'
          >
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors'>
                <svg
                  className='w-6 h-6 text-amber-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-800'>Manage Availability</h3>
                <p className='text-gray-500 text-sm'>Set working hours and block time slots</p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

const ClientSidebar = ({
  clients,
  selectedClient,
  onClientSelect,
  onAddClientClick,
}: {
  clients: Client[];
  selectedClient: Client | null;
  onClientSelect: (client: Client) => void;
  onAddClientClick: () => void;
}) => {
  const handleClientSelect = (client: Client) => {
    // Track client selection
    if (therapistIdSignal.value) {
      trackTherapistClientManagement.clientSelected(therapistIdSignal.value, client.id, {
        user_id: `therapist_${therapistIdSignal.value}`,
      });
    }
    onClientSelect(client);
  };

  const handleAddClientClick = () => {
    // Track add client modal opening
    if (therapistIdSignal.value) {
      trackTherapistClientManagement.addClientModalOpened(therapistIdSignal.value, {
        user_id: `therapist_${therapistIdSignal.value}`,
      });
    }
    onAddClientClick();
  };

  return (
    <div className='p-6 h-full flex flex-col'>
      <h2 className='text-xl font-semibold text-gray-800 mb-4'>Your Clients ({clients.length})</h2>
      <div className='flex-1 overflow-y-auto space-y-2'>
        {clients.map((client) => (
          <button
            key={client.id}
            onClick={() => handleClientSelect(client)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedClient?.id === client.id
                ? 'bg-purple-50 border-purple-200 shadow-sm'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className='flex items-center gap-3'>
              <UserCircle2 className='h-8 w-8 text-gray-400' />
              <div>
                <p className='font-medium text-gray-900'>
                  {client.firstName} {client.lastName}
                </p>
                <p className='text-sm text-gray-500'>{client.email}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={handleAddClientClick}
        className='mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
        aria-label='Invite a Client to Renavest'
      >
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
        </svg>
        <span className='font-medium'>Invite a Client</span>
      </button>
    </div>
  );
};

const ClientDetailView = ({
  client,
  upcomingSessions,
}: {
  client: Client | null;
  upcomingSessions: UpcomingSession[];
}) => {
  // If no client is selected, show all sessions
  const clientSessions = client
    ? upcomingSessions.filter((session) => session.clientId === client.id)
    : upcomingSessions;

  if (!client)
    return (
      <div className='flex items-center justify-center h-full text-gray-500'>
        Select a client to view details
      </div>
    );

  return (
    <div className='p-6 space-y-6 max-h-full overflow-y-auto'>
      <div className='flex items-center gap-4 mb-6'>
        <UserCircle2 className='h-12 w-12 text-purple-600' />
        <div>
          <h2 className='text-2xl font-semibold text-gray-800'>
            {client.firstName} {client.lastName || ''}
          </h2>
          <p className='text-gray-500'>{client.email}</p>
        </div>
      </div>

      <div className='space-y-6'>
        <UpcomingSessionsCard
          sessions={clientSessions}
          onSessionClick={() => {}} // Disable click functionality
        />

        {therapistIdSignal.value && (
          <ClientNotesSection client={client} therapistId={therapistIdSignal.value} />
        )}
      </div>
    </div>
  );
};

const FutureInsightsCards = () => {
  const futureFeatures = [
    {
      title: 'Client Behavior Analysis',
      description: 'Gain deep insights into client progress and patterns',
      icon: (
        <svg
          className='w-8 h-8 text-purple-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      ),
      comingSoon: true,
    },
    {
      title: 'Treatment Effectiveness Tracker',
      description: 'Monitor and evaluate treatment outcomes',
      icon: (
        <svg
          className='w-8 h-8 text-green-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13 10V3L4 14h7v7l9-11h-7z'
          />
        </svg>
      ),
      comingSoon: true,
    },
    {
      title: 'Client Communication Insights',
      description: 'Analyze communication patterns and engagement',
      icon: (
        <svg
          className='w-8 h-8 text-blue-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          />
        </svg>
      ),
      comingSoon: true,
    },
  ];

  return (
    <div className='grid md:grid-cols-3 gap-4'>
      {futureFeatures.map((feature, index) => (
        <div
          key={index}
          className='bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden'
        >
          <div className='flex items-center mb-4'>
            {feature.icon}
            <h3 className='ml-3 text-lg font-semibold text-gray-800'>{feature.title}</h3>
          </div>
          <p className='text-gray-500 text-sm mb-4'>{feature.description}</p>
          {feature.comingSoon && (
            <div className='absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full'>
              Coming Soon
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface TherapistDashboardPageProps {
  initialClients: Client[];
  initialUpcomingSessions: UpcomingSession[];
  initialStatistics: TherapistStatistics;
  initialTherapistId: number;
}

export default function TherapistDashboardPage({
  initialClients,
  initialUpcomingSessions,
  initialStatistics,
  initialTherapistId,
}: TherapistDashboardPageProps) {
  // Initialize signals with server data
  useEffect(() => {
    clientsSignal.value = initialClients;
    upcomingSessionsSignal.value = initialUpcomingSessions;
    statisticsSignal.value = initialStatistics;
  }, [initialClients, initialUpcomingSessions, initialStatistics]);

  // Set therapist ID from props
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

  // If still loading initial data, show a loading state
  if (!therapistPageLoadedSignal.value) {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-purple-600 mx-auto mb-4'></div>
          <p className={`${COLORS.WARM_PURPLE.DEFAULT} text-lg`}>Loading...</p>
        </div>
      </div>
    );
  }

  // Render main dashboard
  return renderDashboard(refreshData);
}

// Helper function to render main dashboard
function renderDashboard(refreshData: () => Promise<void>) {
  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen relative'>
      <TherapistNavbar showBackButton={false} />

      <div className='mt-6'>
        <TherapistStatisticsCard statistics={statisticsSignal.value} />
      </div>

      <QuickActionsSection />

      {/* New section for Future Insights */}
      <div className='mt-6'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>Future Insights</h2>
        <FutureInsightsCards />
      </div>

      <div className='grid grid-cols-12 gap-6 mt-6'>
        <div className='col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm'>
          <ClientSidebar
            clients={clientsSignal.value}
            selectedClient={selectedClientSignal.value}
            onClientSelect={(client) => (selectedClientSignal.value = client)}
            onAddClientClick={() => (isAddClientOpenSignal.value = true)}
          />
        </div>
        <div className='col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm'>
          <ClientDetailView
            client={selectedClientSignal.value}
            upcomingSessions={upcomingSessionsSignal.value}
          />
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddClientOpenSignal.value && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/25 backdrop-blur-sm'
            onClick={() => (isAddClientOpenSignal.value = false)}
          />
          {/* Modal */}
          <div className='relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200'>
            {/* Header */}
            <div className='mb-6 flex justify-between items-center'>
              <h2 className='text-2xl font-semibold text-gray-900'>Invite a Client</h2>
              <button
                onClick={() => (isAddClientOpenSignal.value = false)}
                className='text-gray-400 hover:text-gray-600 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400'
                aria-label='Close Add Client Modal'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <AddNewClientSection onClientAdded={refreshData} />
          </div>
        </div>
      )}
    </div>
  );
}
