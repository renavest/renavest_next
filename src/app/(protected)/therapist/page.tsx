'use client';

import { useUser } from '@clerk/nextjs';
import { FileText, UserCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

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
}: {
  clients: Client[];
  selectedClient: Client | null;
  onClientSelect: (client: Client) => void;
}) => (
  <div className='bg-white border-r border-gray-100 p-4 space-y-2 h-full overflow-y-auto'>
    <h3 className='text-lg font-semibold text-gray-800 mb-4'>Your Clients</h3>
    {clients.map((client) => (
      <div
        key={client.id}
        onClick={() => onClientSelect(client)}
        className={`
          flex items-center p-3 rounded-lg cursor-pointer transition-colors 
          ${
            selectedClient?.id === client.id
              ? 'bg-purple-50 border border-purple-100'
              : 'hover:bg-gray-50'
          }
        `}
      >
        <UserCircle2 className='h-8 w-8 mr-3 text-purple-600' />
        <div>
          <p className='font-medium text-gray-800'>
            {client.firstName} {client.lastName || ''}
          </p>
          <p className='text-xs text-gray-500'>{client.email}</p>
        </div>
      </div>
    ))}
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

  // Log upcoming sessions

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

  // If no clients (likely not a therapist), show the not a therapist section
  if (!isLoading && (clients.length === 0 || error)) {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen flex items-center justify-center'>
        <div className='bg-white rounded-xl p-8 border border-red-100 shadow-sm text-center'>
          <h2 className={`text-xl font-bold ${COLORS.WARM_PURPLE.DEFAULT} mb-4`}>
            Not a Therapist Yet?
          </h2>
          <p className='text-gray-600 mb-6'>
            It looks like you haven&apos;t been registered as a therapist with Renavest.
          </p>
          <div className='flex justify-center space-x-4'>
            <a
              href='/contact'
              className={`px-6 py-3 rounded-lg ${COLORS.WARM_PURPLE.bg} text-white hover:${COLORS.WARM_PURPLE['80']} transition-colors`}
            >
              Email Us to Become a Therapist
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
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
    </div>
  );
}
