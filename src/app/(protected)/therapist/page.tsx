'use client';

import { useUser } from '@clerk/nextjs';
import { FileText, UserCircle2, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

import { GoogleCalendarIntegration } from '@/src/features/google-calendar/components/GoogleCalendarIntegration';
import { AddNewClientSection } from '@/src/features/therapist-dashboard/components/AddNewClientSection';
import ClientNotesSection from '@/src/features/therapist-dashboard/components/ClientNotesSection';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';
import { TherapistStatisticsCard } from '@/src/features/therapist-dashboard/components/TherapistStatisticsCard';
import { UpcomingSessionsCard } from '@/src/features/therapist-dashboard/components/UpcomingSessionsCard';
import { useTherapistDashboardData } from '@/src/features/therapist-dashboard/hooks/useTherapistDashboardData';
import { Client, UpcomingSession } from '@/src/features/therapist-dashboard/types';
import { COLORS } from '@/src/styles/colors';

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
}) => (
  <div className='bg-white border-r border-gray-100 p-4 space-y-2 h-full overflow-y-auto flex flex-col'>
    <h3 className='text-lg font-semibold text-gray-800 mb-4'>Your Clients</h3>
    {clients.map((client) => (
      <div
        key={client.id}
        onClick={() => onClientSelect(client)}
        className={`
          flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all
          border-2
          ${selectedClient?.id === client.id ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-300 shadow-sm'}
          group
        `}
        tabIndex={0}
        role='button'
        aria-pressed={selectedClient?.id === client.id}
      >
        <div className='flex items-center'>
          <UserCircle2 className='h-8 w-8 mr-3 text-purple-600' />
          <div>
            <p className='font-medium text-gray-800'>
              {client.firstName} {client.lastName || ''}
            </p>
            <p className='text-xs text-gray-500'>{client.email}</p>
          </div>
        </div>
        <ChevronRight className='h-5 w-5 text-purple-400 group-hover:text-purple-600 transition-colors' />
      </div>
    ))}
    <button
      onClick={onAddClientClick}
      className='mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
      aria-label='Add New Client'
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
      <span className='font-medium'>Add Client</span>
    </button>
  </div>
);

const ClientDetailView = ({
  client,
  upcomingSessions,
  therapistId,
}: {
  client: Client | null;
  upcomingSessions: UpcomingSession[];
  therapistId: number;
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
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-4 mb-6'>
        <UserCircle2 className='h-12 w-12 text-purple-600' />
        <div>
          <h2 className='text-2xl font-semibold text-gray-800'>
            {client.firstName} {client.lastName || ''}
          </h2>
          <p className='text-gray-500'>{client.email}</p>
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        <UpcomingSessionsCard
          sessions={clientSessions}
          onSessionClick={() => {}} // Disable click functionality
        />

        <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
          <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4'>
            <FileText className='h-5 w-5 text-purple-600' />
            Insights & Analytics
          </h3>
          <div className='space-y-3'>
            <button
              className={`
                w-full p-3 rounded-lg text-center 
                ${COLORS.WARM_PURPLE.bg} text-white 
                hover:${COLORS.WARM_PURPLE['80']} 
                transition-colors
              `}
            >
              Financial Behavior Patterns
            </button>
            <button
              className={`
                w-full p-3 rounded-lg text-center 
                border ${COLORS.WARM_PURPLE.border} 
                ${COLORS.WARM_PURPLE.DEFAULT} 
                hover:${COLORS.WARM_PURPLE['10']} 
                transition-colors
              `}
            >
              Client Progress Tracker
            </button>
            <button
              className={`
                w-full p-3 rounded-lg text-center 
                border ${COLORS.WARM_PURPLE.border} 
                ${COLORS.WARM_PURPLE.DEFAULT} 
                hover:${COLORS.WARM_PURPLE['10']} 
                transition-colors
              `}
            >
              Resource Recommendation Engine
            </button>
          </div>
        </div>
      </div>

      {therapistId && <ClientNotesSection clientId={client.id} />}
    </div>
  );
};

export default function TherapistDashboardPage() {
  const { user } = useUser();
  const { clients, upcomingSessions, statistics, isLoading, error } = useTherapistDashboardData();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [therapistId, setTherapistId] = useState<number | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  // Fetch therapist ID when user is loaded
  useEffect(() => {
    const fetchTherapistId = async () => {
      if (user) {
        try {
          const response = await fetch('/api/therapist/id');
          const data = await response.json();

          if (data.therapistId) {
            setTherapistId(data.therapistId);
          }
        } catch (error) {
          console.error('Failed to fetch therapist ID:', error);
        }
      }
    };

    fetchTherapistId();
  }, [user]);

  // If still loading, show a loading state
  if (isLoading) {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-purple-600 mx-auto mb-4'></div>
          <p className={`${COLORS.WARM_PURPLE.DEFAULT} text-lg`}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // If no clients (likely not a therapist), show the add client section with Google Calendar Integration
  if (!isLoading && (clients.length === 0 || error)) {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen flex items-center justify-center'>
        <div className='w-full max-w-md space-y-6'>
          <AddNewClientSection />
          <GoogleCalendarIntegration />
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen relative'>
      <TherapistNavbar pageTitle={user?.firstName || 'Guest'} />

      <div className='mt-6'>
        <TherapistStatisticsCard statistics={statistics} />
      </div>

      <div className='grid grid-cols-12 gap-6 mt-6'>
        <div className='col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm'>
          <ClientSidebar
            clients={clients}
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient}
            onAddClientClick={() => setIsAddClientOpen(true)}
          />
        </div>
        <div className='col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm'>
          <ClientDetailView
            client={selectedClient}
            upcomingSessions={upcomingSessions}
            therapistId={therapistId || 0}
          />
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddClientOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/25 backdrop-blur-sm'
            onClick={() => setIsAddClientOpen(false)}
          />
          {/* Modal */}
          <div className='relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200'>
            {/* Header */}
            <div className='mb-6 flex justify-between items-center'>
              <h2 className='text-2xl font-semibold text-gray-900'>Add New Client</h2>
              <button
                onClick={() => setIsAddClientOpen(false)}
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
            <AddNewClientSection />
          </div>
        </div>
      )}
    </div>
  );
}
