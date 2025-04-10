'use client';

import { useUser } from '@clerk/nextjs';
import { Calendar, Users, Library, UserCircle2, FileText, TrendingUp, Target } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';

import { ALLOWED_EMAILS } from '@/src/constants';
import ClientNotesSection from '@/src/features/therapist-dashboard/components/ClientNotesSection';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';

// Define types
type Client = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  financialGoals?: string[];
  activeTherapySessions?: number;
  lastSessionDate?: Date;
};

type UpcomingSession = {
  id: string;
  clientName: string;
  clientId: string;
  sessionDate: Date;
  sessionStartTime: Date;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
};

// Placeholder data
const CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    phoneNumber: '(555) 123-4567',
    financialGoals: ['Build emergency fund', 'Reduce debt'],
    activeTherapySessions: 3,
    lastSessionDate: new Date('2023-12-15'),
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phoneNumber: '(555) 987-6543',
    financialGoals: ['Save for home', 'Invest for retirement'],
    activeTherapySessions: 2,
    lastSessionDate: new Date('2023-12-10'),
  },
  {
    id: '3',
    name: 'Sarah Rodriguez',
    email: 'sarah.rodriguez@example.com',
    phoneNumber: '(555) 456-7890',
    financialGoals: ['Start business', 'Improve credit score'],
    activeTherapySessions: 4,
    lastSessionDate: new Date('2023-12-20'),
  },
];

const UPCOMING_SESSIONS: UpcomingSession[] = [
  {
    id: 'session1',
    clientName: 'Emily Johnson',
    clientId: '1',
    sessionDate: new Date('2024-01-15'),
    sessionStartTime: new Date('2024-01-15T14:00:00'),
    status: 'scheduled',
  },
  {
    id: 'session2',
    clientName: 'Michael Chen',
    clientId: '2',
    sessionDate: new Date('2024-01-20'),
    sessionStartTime: new Date('2024-01-20T10:00:00'),
    status: 'confirmed',
  },
];

function UpcomingSessionsCard({
  sessions,
  onSessionClick,
}: {
  sessions: UpcomingSession[];
  onSessionClick: (clientId: string) => void;
}) {
  return (
    <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
          <Calendar className='h-5 w-5 text-purple-600' />
          Upcoming Sessions
        </h3>
      </div>
      <div className='space-y-4'>
        {sessions.length === 0 ? (
          <p className='text-gray-500 text-center'>No upcoming sessions</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSessionClick(session.clientId)}
              className='flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-purple-50 cursor-pointer transition-colors'
            >
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-medium text-gray-800'>{session.clientName}</p>
                  <p className='text-sm text-gray-500'>
                    {session.sessionDate.toLocaleDateString()}
                  </p>
                </div>
                <p className='text-sm font-medium text-purple-600'>
                  {session.sessionStartTime.toLocaleTimeString()}
                </p>
              </div>
              <p className='text-xs text-gray-600 capitalize'>{session.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ClientDetailModal({
  client,
  isOpen,
  onClose,
}: {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!client || !isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl p-8 w-[800px] max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-semibold text-gray-800 flex items-center gap-3'>
            <UserCircle2 className='h-8 w-8 text-purple-600' />
            {client.name} - Client Details
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-full'
          >
            Close
          </button>
        </div>

        <div className='grid md:grid-cols-3 gap-6 mb-6'>
          <div>
            <p className='text-xs text-gray-500 mb-1'>Email</p>
            <p className='font-medium text-gray-800'>{client.email}</p>
          </div>
          <div>
            <p className='text-xs text-gray-500 mb-1'>Phone Number</p>
            <p className='font-medium text-gray-800'>{client.phoneNumber}</p>
          </div>
          <div>
            <p className='text-xs text-gray-500 mb-1'>Last Session</p>
            <p className='font-medium text-gray-800'>
              {client.lastSessionDate?.toLocaleDateString() || 'N/A'}
            </p>
          </div>
        </div>

        <div className='grid md:grid-cols-3 gap-6 mb-6'>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h4 className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
              <FileText className='h-4 w-4 text-purple-600' />
              Client Notes
            </h4>
            <ClientNotesSection clientId={client.id} />
          </div>

          <div className='bg-gray-50 p-4 rounded-lg'>
            <h4 className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
              <TrendingUp className='h-4 w-4 text-purple-600' />
              Client Progress
            </h4>
            <div className='space-y-2'>
              <div>
                <p className='text-xs text-gray-500'>Goal Achievement</p>
                <div className='w-full bg-gray-200 rounded-full h-2.5'>
                  <div className='bg-purple-600 h-2.5 rounded-full' style={{ width: '72%' }} />
                </div>
                <p className='text-xs text-gray-500 mt-1'>72% Complete</p>
              </div>
              <div>
                <p className='text-xs text-gray-500'>Money Script Progress</p>
                <div className='w-full bg-gray-200 rounded-full h-2.5'>
                  <div className='bg-purple-600 h-2.5 rounded-full' style={{ width: '65%' }} />
                </div>
                <p className='text-xs text-gray-500 mt-1'>65% Complete</p>
              </div>
            </div>
          </div>

          <div className='bg-gray-50 p-4 rounded-lg'>
            <h4 className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
              <Target className='h-4 w-4 text-purple-600' />
              Financial Goals
            </h4>
            <div className='space-y-2'>
              {client.financialGoals?.map((goal, index) => (
                <div key={index} className='bg-white p-2 rounded-lg border border-gray-100'>
                  <p className='text-xs text-gray-800'>{goal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TherapistDashboardPage() {
  const { user, isLoaded } = useUser();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      redirect('/login');
    }

    // Check if the user's email is allowed
    if (isLoaded && user && !ALLOWED_EMAILS.includes(user.emailAddresses[0]?.emailAddress || '')) {
      redirect('/explore');
    }
  }, [user, isLoaded]);

  const handleSessionClick = (clientId: string) => {
    const client = CLIENTS.find((c) => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setIsClientDetailModalOpen(true);
    }
  };

  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24'>
      <TherapistNavbar pageTitle={user?.firstName || 'Guest'} />

      <div className='grid md:grid-cols-12 gap-6'>
        <div className='md:col-span-4'>
          <UpcomingSessionsCard sessions={UPCOMING_SESSIONS} onSessionClick={handleSessionClick} />
        </div>

        <div className='md:col-span-8'>
          <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                <Users className='h-5 w-5 text-purple-600' />
                Your Clients
              </h3>
            </div>
            <div className='grid md:grid-cols-3 gap-4'>
              {CLIENTS.map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setIsClientDetailModalOpen(true);
                  }}
                  className='bg-gray-50 p-4 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors'
                >
                  <UserCircle2 className='h-8 w-8 text-purple-600 mb-2' />
                  <p className='font-medium text-gray-800'>{client.name}</p>
                  <p className='text-xs text-gray-500'>{client.email}</p>
                </div>
              ))}
            </div>
          </div>
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
