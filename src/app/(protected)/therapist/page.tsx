'use client';

import { useUser } from '@clerk/nextjs';
import { Calendar, FileText } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ALLOWED_EMAILS } from '@/src/constants';
import {
  clientMetricsSignal,
  sessionStatsSignal,
  earningsMetricsSignal,
} from '@/src/features/therapist-dashboard/state/therapistDashboardState';
import MetricCard from '@/src/shared/components/MetricCard';

function AppointmentCard() {
  return (
    <div className='space-y-6'>
      {/* Today's Sessions */}
      <div className='bg-white rounded-xl p-4 md:p-6 border border-purple-100 shadow-sm'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>Today's Sessions</h3>
          <Calendar className='h-5 w-5 text-purple-600' />
        </div>
        <div className='space-y-4'>
          {[
            {
              name: 'Sarah Johnson',
              type: 'Follow-up Session',
              time: '2:00 PM',
              status: 'Pre-meeting notes ready',
            },
            {
              name: 'Michael Chen',
              type: 'Initial Consultation',
              time: '3:30 PM',
              status: 'Intake form completed',
            },
            {
              name: 'Emily Davis',
              type: 'Monthly Review',
              time: '5:00 PM',
              status: 'Goals review pending',
            },
          ].map((session, i) => (
            <div
              key={i}
              className='flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100'
            >
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-medium text-gray-800'>{session.name}</p>
                  <p className='text-sm text-gray-500'>{session.type}</p>
                </div>
                <p className='text-sm font-medium text-purple-600'>{session.time}</p>
              </div>
              <p className='text-xs text-gray-600'>{session.status}</p>
            </div>
          ))}
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
              'Complete session notes for Alex R.',
              'Send financial worksheet to Maria P.',
              'Review spending patterns alert for David K.',
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

function DashboardHeader({ userName }: { userName: string }) {
  return (
    <header className='bg-white -mx-6 px-6 py-8 border-b border-purple-100 mb-12'>
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
            Welcome back, {userName || 'Guest'}
          </h1>
          <p className='text-gray-500 mt-2 text-base md:text-lg'>
            Manage your sessions, client progress, and therapeutic resources.
          </p>
        </div>
      </div>
    </header>
  );
}

function MetricsContent() {
  const [clientMetrics, setClientMetrics] = useState({
    activeClients: 0,
    clientSatisfactionRate: 0,
  });
  const [sessionStats, setSessionStats] = useState({
    upcomingSessions: 0,
  });
  const [earningsMetrics, setEarningsMetrics] = useState({
    currentMonthEarnings: 0,
  });

  useEffect(() => {
    // Update state from signals
    setClientMetrics(clientMetricsSignal.value);
    setSessionStats(sessionStatsSignal.value);
    setEarningsMetrics(earningsMetricsSignal.value);
  }, []);

  return (
    <div className='md:col-span-8'>
      {/* Session Preparation */}
      <MetricsSection title='Session Preparation'>
        <MetricCard title='Pre-Meeting Notes' value='8' subtitle='Pending completion' />
        <MetricCard title='Client Alerts' value='3' subtitle='Require attention' />
        <MetricCard title='Resource Library' value='24' subtitle='Custom worksheets' />
        <MetricCard
          title='Active Clients'
          value={clientMetrics.activeClients}
          subtitle='This month'
        />
      </MetricsSection>

      {/* Client Progress */}
      <MetricsSection title='Client Progress'>
        <MetricCard title='Goal Achievement' value='72%' subtitle='Average completion' trend={+8} />
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
          value={`${clientMetrics.clientSatisfactionRate}%`}
          subtitle='Last 30 days'
          trend={+10}
        />
      </MetricsSection>

      {/* Practice Overview */}
      <MetricsSection title='Practice Overview'>
        <MetricCard
          title='This Week'
          value={sessionStats.upcomingSessions}
          subtitle='Scheduled sessions'
        />
        <MetricCard title='Follow-ups' value='12' subtitle='Pending actions' />
        <MetricCard title='New Clients' value='5' subtitle='Last 30 days' trend={+15} />
        <MetricCard
          title='Monthly Revenue'
          value={`$${earningsMetrics.currentMonthEarnings.toLocaleString()}`}
          subtitle='Current month'
          trend={+8}
        />
      </MetricsSection>
    </div>
  );
}

export default function TherapistDashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    redirect('/login');
  }
  if (!ALLOWED_EMAILS.includes(user?.emailAddresses[0]?.emailAddress || '')) {
    redirect('/explore');
  }

  return (
    <div className='container mx-auto px-4 md:px-6 py-8'>
      <DashboardHeader userName={user?.firstName || 'Guest'} />
      <div className='grid md:grid-cols-12 gap-6'>
        <MetricsContent />
        <div className='md:col-span-4'>
          <AppointmentCard />
        </div>
      </div>
    </div>
  );
}
