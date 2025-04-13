'use client';

import { useUser } from '@clerk/nextjs';
import { Users, UserCircle2, Calendar, FileText, PlusCircle } from 'lucide-react';
import { useState } from 'react';

import { ClientDetailModal } from '@/src/features/therapist-dashboard/components/ClientDetailModal';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';
import { UpcomingSessionsCard } from '@/src/features/therapist-dashboard/components/UpcomingSessionsCard';
import { useTherapistDashboardData } from '@/src/features/therapist-dashboard/hooks/useTherapistDashboardData';
import { Client } from '@/src/features/therapist-dashboard/types';
import { COLORS } from '@/src/styles/colors';

type QuickActionButtonProps = {
  icon: React.ElementType;
  label: string;
};

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon: Icon, label }) => (
  <button
    className={`p-3 rounded-lg text-center ${COLORS.WARM_PURPLE['5']} hover:${COLORS.WARM_PURPLE.hover} transition-colors`}
  >
    <Icon className='mx-auto mb-2 h-6 w-6' />
    <span className='text-xs'>{label}</span>
  </button>
);

type RecentNoteCardProps = {
  title: string;
  description: string;
  timestamp: string;
};

const RecentNoteCard: React.FC<RecentNoteCardProps> = ({ title, description, timestamp }) => (
  <div className='bg-gray-50 p-4 rounded-lg'>
    <div className='flex justify-between items-center mb-2'>
      <span className='font-medium text-gray-800'>{title}</span>
      <span className='text-xs text-gray-500'>{timestamp}</span>
    </div>
    <p className='text-sm text-gray-600 line-clamp-2'>{description}</p>
  </div>
);

const QuickActionsSection = () => (
  <div className={`bg-white rounded-xl p-6 border ${COLORS.WARM_PURPLE.border} shadow-sm`}>
    <h3
      className={`text-lg font-semibold ${COLORS.WARM_PURPLE.DEFAULT} flex items-center gap-2 mb-4`}
    >
      <PlusCircle className='h-5 w-5' />
      Quick Actions
    </h3>
    <div className='grid grid-cols-3 gap-4'>
      <QuickActionButton icon={FileText} label='New Note' />
      <QuickActionButton icon={Calendar} label='Book Session' />
      <QuickActionButton icon={Users} label='Add Client' />
    </div>
  </div>
);

const ClientsOverviewSection = ({
  clients,
  onClientClick,
}: {
  clients: Client[];
  onClientClick: (client: Client) => void;
}) => (
  <div className={`bg-white rounded-xl p-6 border ${COLORS.WARM_PURPLE.border} shadow-sm`}>
    <div className='flex items-center justify-between mb-4'>
      <h3 className={`text-lg font-semibold ${COLORS.WARM_PURPLE.DEFAULT} flex items-center gap-2`}>
        <Users className='h-5 w-5' />
        Your Clients
      </h3>
      <button
        className={`text-xs ${COLORS.WARM_PURPLE.DEFAULT} hover:${COLORS.WARM_PURPLE.hoverText}`}
      >
        View All
      </button>
    </div>
    <div className='grid md:grid-cols-3 gap-4'>
      {clients.map((client) => (
        <div
          key={client.id}
          onClick={() => onClientClick(client)}
          className={`bg-gray-50 p-4 rounded-lg hover:${COLORS.WARM_PURPLE['10']} cursor-pointer transition-colors group`}
        >
          <UserCircle2
            className={`h-8 w-8 ${COLORS.WARM_PURPLE.DEFAULT} mb-2 group-hover:scale-110 transition-transform`}
          />
          <p className='font-medium text-gray-800'>
            {client.firstName} {client.lastName || ''}
          </p>
          <p className='text-xs text-gray-500'>{client.email}</p>
        </div>
      ))}
    </div>
  </div>
);

const RecentNotesSection = () => (
  <div className={`bg-white rounded-xl p-6 border ${COLORS.WARM_PURPLE.border} shadow-sm`}>
    <div className='flex items-center justify-between mb-4'>
      <h3 className={`text-lg font-semibold ${COLORS.WARM_PURPLE.DEFAULT} flex items-center gap-2`}>
        <FileText className='h-5 w-5' />
        Recent Notes & Insights
      </h3>
      <button
        className={`text-xs ${COLORS.WARM_PURPLE.DEFAULT} hover:${COLORS.WARM_PURPLE.hoverText}`}
      >
        View All Notes
      </button>
    </div>
    <div className='space-y-4'>
      <RecentNoteCard
        title='Client Progress Review'
        description="Key observations on client's financial anxiety and progress in developing healthier money management strategies."
        timestamp='2 days ago'
      />
      <RecentNoteCard
        title='Session Reflection'
        description='Discussed breakthrough in understanding underlying emotional triggers related to spending habits.'
        timestamp='1 week ago'
      />
    </div>
  </div>
);

export default function TherapistDashboardPage() {
  const { user } = useUser();
  const { clients, upcomingSessions } = useTherapistDashboardData();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);

  const handleSessionClick = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setIsClientDetailModalOpen(true);
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailModalOpen(true);
  };

  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar pageTitle={user?.firstName || 'Guest'} />

      <div className='grid md:grid-cols-12 gap-6'>
        {/* Left Sidebar: Quick Actions & Upcoming Sessions */}
        <div className='md:col-span-4 space-y-6'>
          <QuickActionsSection />
          <UpcomingSessionsCard sessions={upcomingSessions} onSessionClick={handleSessionClick} />
        </div>

        {/* Right Main Content: Clients & Overview */}
        <div className='md:col-span-8 space-y-6'>
          <ClientsOverviewSection clients={clients} onClientClick={handleClientClick} />
          <RecentNotesSection />
        </div>
      </div>

      <ClientDetailModal
        client={selectedClient}
        isOpen={isClientDetailModalOpen}
        onClose={() => setIsClientDetailModalOpen(false)}
      />
    </div>
  );
}
