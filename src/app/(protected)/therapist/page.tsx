'use client';

import { useUser } from '@clerk/nextjs';
import { Calendar } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

import { ALLOWED_EMAILS } from '@/src/constants';
import ClientNotesSection from '@/src/features/therapist-dashboard/components/ClientNotesSection';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/TherapistNavbar';

// Define types for session and metrics
type UpcomingSession = {
  id: number;
  clientName: string;
  sessionDate: string | Date;
  sessionStartTime: string | Date;
  status: string;
};

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

export default function TherapistDashboardPage() {
  const { user, isLoaded } = useUser();

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
      <div className='grid md:grid-cols-12 gap-6'>
        <div className='md:col-span-12'>
          {/* Session Preparation */}
          <MetricsSection title='Session Preparation'>
            <div className='grid md:grid-cols-3 gap-6'>
              <MetricCard title='Total Clients' value={0} subtitle='All time' />
              <MetricCard title='Active Clients' value={0} subtitle='Currently engaged' />
              <MetricCard title='Completed Sessions' value={0} subtitle='Total sessions' />
            </div>
            <div className='grid md:grid-cols-3 gap-6 mt-6'>
              <MetricCard title='Resource Library' value='24' subtitle='Custom worksheets' />
            </div>
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
