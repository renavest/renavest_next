'use server';

import { currentUser } from '@clerk/nextjs/server';
import { Calendar, FileText } from 'lucide-react';
import { redirect } from 'next/navigation';

import { ALLOWED_EMAILS } from '@/src/constants';
import { db } from '@/src/db';
import Navbar from '@/src/features/home/components/Navbar';
import { fetchTherapistDashboardData } from '@/src/features/therapist-dashboard/actions/therapistDashboardActions';

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
      {/* Today's Sessions */}
      <div className='bg-white rounded-xl p-4 md:p-6 border border-purple-100 shadow-sm'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>Upcoming Sessions</h3>
          <Calendar className='h-5 w-5 text-purple-600' />
        </div>
        <div className='space-y-4'>
          {upcomingSessions.length === 0 ? (
            <p className='text-gray-500 text-center'>No upcoming sessions</p>
          ) : (
            upcomingSessions.map((session: UpcomingSession) => (
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

      {/* Action Items */}
      <div className='bg-white rounded-xl p-4 md:p-6 border border-purple-100 shadow-sm'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>Action Items</h3>
          <FileText className='h-5 w-5 text-purple-600' />
        </div>
        <div className='space-y-3'>
          <p className='text-sm text-gray-600'>Post-meeting tasks:</p>
          <div className='space-y-2'>
            {[
              'Complete session notes for recent clients',
              'Review client progress and goals',
              'Update client resources',
            ].map((task, i) => (
              <div
                key={i}
                className='flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded'
              >
                <div className='h-2 w-2 rounded-full bg-purple-400' />
                {task}
              </div>
            ))}
          </div>
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

export default async function TherapistDashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/login');
  }

  // Check if the user's email is allowed
  if (!ALLOWED_EMAILS.includes(user.emailAddresses[0]?.emailAddress || '')) {
    redirect('/explore');
  }

  // Fetch the first therapist (for now)
  const firstTherapist = await db.query.therapists.findFirst();

  if (!firstTherapist) {
    return <div>No therapists found</div>;
  }

  // Fetch therapist dashboard data
  const { upcomingSessions, clientMetrics } = await fetchTherapistDashboardData(firstTherapist.id);

  return (
    <div className='container mx-auto px-4 md:px-6 py-8'>
      <Navbar pageTitle={user.firstName || 'Guest'} />
      <div className='grid md:grid-cols-12 gap-6'>
        <div className='md:col-span-8'>
          {/* Session Preparation */}
          <MetricsSection title='Session Preparation'>
            <MetricCard
              title='Total Clients'
              value={clientMetrics.totalClients}
              subtitle='All time'
            />
            <MetricCard
              title='Active Clients'
              value={clientMetrics.activeClients}
              subtitle='Currently engaged'
            />
            <MetricCard
              title='Completed Sessions'
              value={clientMetrics.completedSessions}
              subtitle='Total sessions'
            />
            <MetricCard title='Resource Library' value='24' subtitle='Custom worksheets' />
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
        <div className='md:col-span-4'>
          <AppointmentCard upcomingSessions={upcomingSessions} />
        </div>
      </div>
    </div>
  );
}
