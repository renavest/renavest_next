'use client';

import { useUser } from '@clerk/nextjs';
import { Calendar, Users, Library, UserCircle2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ALLOWED_EMAILS } from '@/src/constants';
import ClientNotesSection from '@/src/features/therapist-dashboard/components/ClientNotesSection';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';

// Define a more comprehensive client type
type Client = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  financialGoals?: string[];
  activeTherapySessions?: number;
  lastSessionDate?: Date;
};

// Placeholder client data (would typically come from a database)
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

function AppointmentCard({ upcomingSessions }: { upcomingSessions: UpcomingSession[] }) {
  return (
    <div className='space-y-6'>
      <div className='bg-white rounded-xl p-4 md:p-6 border border-purple-100 shadow-sm'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>Upcoming Sessions</h3>
          <Calendar className='h-5 w-5 text-purple-600' />
        </div>
        <div className='space-y-4'>
          {upcomingSessions.length === 0 ? (
            <p className='text-gray-500 text-center'>No upcoming sessions</p>
          ) : (
            upcomingSessions.map((session) => (
              <div
                key={session.id}
                className='flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100'
              >
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='font-medium text-gray-800'>{session.clientName}</p>
                    <p className='text-sm text-gray-500'>
                      {new Date(session.sessionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className='text-sm font-medium text-purple-600'>
                    {new Date(session.sessionStartTime).toLocaleTimeString()}
                  </p>
                </div>
                <p className='text-xs text-gray-600 capitalize'>{session.status}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MetricsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='mb-12'>
      <div className='flex items-center gap-4 mb-6'>
        <h2 className='text-xl md:text-2xl font-semibold text-gray-700'>{title}</h2>
        <div className='h-px flex-grow bg-purple-50' />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>{children}</div>
    </section>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
}) {
  return (
    <div className='bg-white rounded-xl p-4 border border-purple-100 shadow-sm'>
      <div className='flex justify-between items-start'>
        <div>
          <p className='text-sm text-gray-500 mb-1'>{title}</p>
          <p className='text-2xl font-bold text-gray-800'>{value}</p>
        </div>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      <p className='text-xs text-gray-500 mt-2'>{subtitle}</p>
    </div>
  );
}

function ClientSelectionModal({
  isOpen,
  onClose,
  onClientSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onClientSelect: (client: Client) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold text-gray-800'>Select Client</h2>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
            Close
          </button>
        </div>
        <div className='space-y-2'>
          {CLIENTS.map((client) => (
            <button
              key={client.id}
              onClick={() => {
                onClientSelect(client);
                onClose();
              }}
              className='w-full text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-3'
            >
              <UserCircle2 className='h-8 w-8 text-purple-600' />
              <div>
                <p className='font-medium text-gray-800'>{client.name}</p>
                <p className='text-xs text-gray-500'>{client.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SelectedClientCard({ client }: { client: Client }) {
  return (
    <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
      <div className='flex items-center gap-4 mb-6'>
        <UserCircle2 className='h-12 w-12 text-purple-600' />
        <div>
          <h3 className='text-xl font-semibold text-gray-800'>{client.name}</h3>
          <p className='text-sm text-gray-500'>{client.email}</p>
        </div>
      </div>
      <div className='grid md:grid-cols-3 gap-4'>
        <div>
          <p className='text-xs text-gray-500 mb-1'>Phone Number</p>
          <p className='font-medium text-gray-800'>{client.phoneNumber}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500 mb-1'>Active Therapy Sessions</p>
          <p className='font-medium text-gray-800'>{client.activeTherapySessions}</p>
        </div>
        <div>
          <p className='text-xs text-gray-500 mb-1'>Last Session</p>
          <p className='font-medium text-gray-800'>
            {client.lastSessionDate ? client.lastSessionDate.toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
      <div className='mt-6'>
        <p className='text-sm text-gray-500 mb-2'>Financial Goals</p>
        <div className='flex flex-wrap gap-2'>
          {client.financialGoals?.map((goal, index) => (
            <span
              key={index}
              className='bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full'
            >
              {goal}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TherapistDashboardPage() {
  const { user, isLoaded } = useUser();
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      redirect('/login');
    }

    // Check if the user's email is allowed
    if (isLoaded && user && !ALLOWED_EMAILS.includes(user.emailAddresses[0]?.emailAddress || '')) {
      redirect('/explore');
    }
  }, [user, isLoaded]);

  // TODO: Implement data fetching using React Query or SWR
  // Currently using placeholder values due to server-side data fetching limitations in client components
  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24'>
      <TherapistNavbar pageTitle={user?.firstName || 'Guest'} />

      {/* Client Selection Button */}
      <div className='mb-6 flex justify-between items-center'>
        <h2 className='text-2xl font-semibold text-gray-800'>
          {selectedClient ? `Client: ${selectedClient.name}` : 'No Client Selected'}
        </h2>
        <button
          onClick={() => setIsClientModalOpen(true)}
          className='flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
        >
          <Users className='h-5 w-5' />
          Select Client
        </button>
      </div>

      <ClientSelectionModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientSelect={(client) => setSelectedClient(client)}
      />

      {selectedClient && (
        <div className='mb-6'>
          <SelectedClientCard client={selectedClient} />
        </div>
      )}

      <div className='grid md:grid-cols-12 gap-6'>
        <div className='md:col-span-12'>
          {/* Session Preparation */}
          <MetricsSection title='Session Preparation'>
            <div className='grid md:grid-cols-3 gap-6'>
              <MetricCard title='Total Clients' value={CLIENTS.length} subtitle='All time' />
              <MetricCard
                title='Active Clients'
                value={
                  CLIENTS.filter((c) => c.activeTherapySessions && c.activeTherapySessions > 0)
                    .length
                }
                subtitle='Currently engaged'
              />
              <MetricCard
                title='Completed Sessions'
                value={CLIENTS.reduce((sum, c) => sum + (c.activeTherapySessions || 0), 0)}
                subtitle='Total sessions'
              />
            </div>

            {/* Resource Library as a full-width card */}
            <div className='mt-6'>
              <div className='flex items-center gap-4 mb-6'>
                <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                  <Library className='h-5 w-5 text-purple-600' />
                  Resource Library
                </h3>
                <div className='h-px flex-grow bg-purple-50' />
              </div>
              <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
                <div className='grid md:grid-cols-4 gap-4'>
                  {[
                    { title: 'Money Scripts', count: 12 },
                    { title: 'Goal Worksheets', count: 8 },
                    { title: 'Emotional Guides', count: 4 },
                    { title: 'Financial Assessments', count: 6 },
                  ].map((resource, index) => (
                    <div
                      key={index}
                      className='bg-gray-50 p-4 rounded-lg hover:bg-purple-50 transition-colors'
                    >
                      <h4 className='font-medium text-gray-800 mb-2'>{resource.title}</h4>
                      <p className='text-2xl font-bold text-purple-600'>{resource.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className='mt-6'>
              <div className='flex items-center gap-4 mb-6'>
                <h3 className='text-lg font-semibold text-gray-800'>Upcoming Sessions</h3>
                <div className='h-px flex-grow bg-purple-50' />
              </div>
              <AppointmentCard upcomingSessions={[]} />
            </div>
          </MetricsSection>

          {/* Client Progress */}
          <MetricsSection title='Client Progress'>
            <MetricCard
              title='Goal Achievement'
              value='72%'
              subtitle='Average completion'
              trend={+8}
            />
            <MetricCard
              title='Money Script Progress'
              value='65%'
              subtitle='Positive changes'
              trend={+12}
            />
            <MetricCard
              title='Engagement Rate'
              value='88%'
              subtitle='Resource utilization'
              trend={+5}
            />
            <MetricCard
              title='Satisfaction Score'
              value='85%'
              subtitle='Last 30 days'
              trend={+10}
            />
          </MetricsSection>
        </div>
        <div className='md:col-span-12'>
          <ClientNotesSection />
        </div>
      </div>
    </div>
  );
}
