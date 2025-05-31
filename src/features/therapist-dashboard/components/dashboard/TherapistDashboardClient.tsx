'use client';

import { UserCircle2, Users, FileText, Calendar, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';

import {
  trackTherapistDashboard,
  trackTherapistClientManagement,
  trackTherapistSessions,
} from '@/src/features/posthog/therapistTracking';
import { AddNewClientSection } from '@/src/features/therapist-dashboard/components/clients/AddNewClientSection';
import { ClientNotesSection } from '@/src/features/therapist-dashboard/components/clients/ClientNotesSection';
import { TherapistStatisticsCard } from '@/src/features/therapist-dashboard/components/dashboard/TherapistStatisticsCard';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/navigation/TherapistNavbar';
import { UpcomingSessionsCard } from '@/src/features/therapist-dashboard/components/sessions/UpcomingSessionsCard';
import {
  therapistIdSignal,
  therapistPageLoadedSignal,
  clientsSignal,
  upcomingSessionsSignal,
  statisticsSignal,
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

type ClientTab = 'overview' | 'notes' | 'sessions' | 'progress';

// New comprehensive client management component
const ClientManagementSection = ({
  clients,
  upcomingSessions,
  onAddClientClick,
}: {
  clients: Client[];
  upcomingSessions: UpcomingSession[];
  onAddClientClick: () => void;
}) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    clients.length > 0 ? clients[0] : null,
  );
  const [activeTab, setActiveTab] = useState<ClientTab>('overview');

  // Update selected client when clients list changes
  useEffect(() => {
    if (!selectedClient && clients.length > 0) {
      setSelectedClient(clients[0]);
    }
  }, [clients, selectedClient]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setActiveTab('overview'); // Reset to overview when switching clients

    // Track client selection
    if (therapistIdSignal.value) {
      trackTherapistClientManagement.clientSelected(therapistIdSignal.value, client.id, {
        user_id: `therapist_${therapistIdSignal.value}`,
      });
    }
  };

  const clientSessions = selectedClient
    ? upcomingSessions.filter((session) => session.clientId === selectedClient.id)
    : [];

  return (
    <div className='bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden'>
      {/* Header with Client Selector */}
      <div className='bg-gradient-to-r from-purple-50/50 to-indigo-50/30 p-6 border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='w-2 h-12 bg-gradient-to-b from-[#9071FF] to-purple-600 rounded-full'></div>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-1'>Client Management</h2>
              <p className='text-gray-600'>Comprehensive client care and documentation</p>
            </div>
          </div>

          {/* Client Selector Dropdown */}
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-3'>
              <label className='text-sm font-medium text-gray-700'>Active Client:</label>
              <select
                value={selectedClient?.id || ''}
                onChange={(e) => {
                  const clientId = e.target.value;
                  const client = clients.find((c) => c.id === clientId);
                  if (client) handleClientSelect(client);
                }}
                className='px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9071FF] focus:border-transparent bg-white text-gray-700 font-medium min-w-[200px]'
              >
                {clients.length === 0 && <option value=''>No clients yet</option>}
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onAddClientClick}
              className='inline-flex items-center gap-2 px-4 py-2 bg-[#9071FF] text-white rounded-lg hover:bg-[#7c5ce8] transition-all duration-200 text-sm font-medium'
            >
              <Plus className='w-4 h-4' />
              Invite Client
            </button>
          </div>
        </div>

        {/* Selected Client Info */}
        {selectedClient && (
          <div className='mt-6 flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100'>
            <UserCircle2 className='h-12 w-12 text-[#9071FF]' />
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                {selectedClient.firstName} {selectedClient.lastName || ''}
              </h3>
              <p className='text-gray-600'>{selectedClient.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      {selectedClient && (
        <>
          <div className='border-b border-gray-100 bg-gray-50/50'>
            <nav className='flex space-x-8 px-6'>
              {[
                { key: 'overview', label: 'Overview', icon: Users },
                { key: 'notes', label: 'Clinical Notes', icon: FileText },
                { key: 'sessions', label: 'Sessions', icon: Calendar },
                { key: 'progress', label: 'Progress', icon: TrendingUp },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as ClientTab)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === key
                      ? 'border-[#9071FF] text-[#9071FF]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className='p-6'>
            {activeTab === 'overview' && (
              <ClientOverviewTab client={selectedClient} sessions={clientSessions} />
            )}
            {activeTab === 'notes' && therapistIdSignal.value && (
              <ClientNotesSection client={selectedClient} therapistId={therapistIdSignal.value} />
            )}
            {activeTab === 'sessions' && <ClientSessionsTab sessions={clientSessions} />}
            {activeTab === 'progress' && <ClientProgressTab />}
          </div>
        </>
      )}

      {/* No Client Selected State */}
      {!selectedClient && (
        <div className='p-16 text-center'>
          <div className='w-16 h-16 bg-gradient-to-br from-[#9071FF] to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6'>
            <Users className='w-8 h-8 text-white' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>No Clients Yet</h3>
          <p className='text-gray-600 mb-6'>Add your first client to start managing their care</p>
          <button
            onClick={onAddClientClick}
            className='inline-flex items-center gap-2 px-6 py-3 bg-[#9071FF] text-white rounded-xl hover:bg-[#7c5ce8] transition-all duration-200 font-medium'
          >
            <Plus className='w-5 h-5' />
            Add Your First Client
          </button>
        </div>
      )}
    </div>
  );
};

// Tab content components
const ClientOverviewTab = ({
  client,
  sessions,
}: {
  client: Client;
  sessions: UpcomingSession[];
}) => {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      <div className='space-y-6'>
        <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200'>
          <h4 className='text-lg font-semibold text-blue-900 mb-3'>Client Information</h4>
          <div className='space-y-3 text-blue-800'>
            <p>
              <span className='font-medium'>Name:</span> {client.firstName} {client.lastName}
            </p>
            <p>
              <span className='font-medium'>Email:</span> {client.email}
            </p>
            <p>
              <span className='font-medium'>Status:</span> Active
            </p>
          </div>
        </div>

        <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200'>
          <h4 className='text-lg font-semibold text-green-900 mb-3'>Recent Activity</h4>
          <p className='text-green-800'>Last session: Coming soon</p>
        </div>
      </div>

      <div className='space-y-6'>
        <UpcomingSessionsCard sessions={sessions} onSessionClick={() => {}} />
      </div>
    </div>
  );
};

const ClientSessionsTab = ({ sessions }: { sessions: UpcomingSession[] }) => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-semibold text-gray-900'>Session Management</h3>
        <button className='px-4 py-2 bg-[#9071FF] text-white rounded-lg hover:bg-[#7c5ce8] transition-colors text-sm font-medium'>
          Schedule Session
        </button>
      </div>
      <UpcomingSessionsCard sessions={sessions} onSessionClick={() => {}} />
    </div>
  );
};

const ClientProgressTab = () => {
  return (
    <div className='text-center py-16'>
      <div className='w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6'>
        <TrendingUp className='w-8 h-8 text-amber-600' />
      </div>
      <h3 className='text-xl font-semibold text-gray-900 mb-2'>Progress Tracking</h3>
      <p className='text-gray-600'>Progress tracking features coming soon</p>
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

      {/* Redesigned Client Management Section */}
      <div className='mt-8'>
        <ClientManagementSection
          clients={clientsSignal.value}
          upcomingSessions={upcomingSessionsSignal.value}
          onAddClientClick={() => (isAddClientOpenSignal.value = true)}
        />
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
