'use client';

import { useUser } from '@clerk/nextjs';
import { Calendar } from 'lucide-react';

import {
  clientMetricsSignal,
  sessionStatsSignal,
  earningsMetricsSignal,
} from '@/src/features/therapist-dashboard/state/therapistDashboardState';
import { cn } from '@/src/lib/utils';
import MetricCard from '@/src/shared/components/MetricCard';
import { COLORS } from '@/src/styles/colors';

function AppointmentCard() {
  return (
    <div className='bg-white rounded-xl p-4 md:p-6 border border-gray-100 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-800'>Upcoming Sessions</h3>
        <Calendar className='h-5 w-5 text-gray-400' />
      </div>
      <div className='space-y-4'>
        {[1, 2, 3].map((_, i) => (
          <div key={i} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
            <div>
              <p className='font-medium text-gray-800'>John Smith</p>
              <p className='text-sm text-gray-500'>First Session</p>
            </div>
            <p className='text-sm text-gray-600'>2:00 PM</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TherapistDashboardPage() {
  const { user } = useUser();
  const clientMetrics = clientMetricsSignal.value;
  const sessionStats = sessionStatsSignal.value;
  const earningsMetrics = earningsMetricsSignal.value;

  return (
    <div className={cn('min-h-screen', COLORS.WARM_WHITE.bg)}>
      <main className='container mx-auto px-4 pt-24 md:pt-32 pb-8'>
        {/* Welcome Section */}
        <div className='mb-8 md:mb-12'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-800'>
            Welcome back, {user?.firstName}
          </h1>
          <p className='text-gray-500 mt-2 text-base md:text-lg'>
            Here's an overview of your practice and upcoming sessions.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-12 gap-8'>
          <div className='md:col-span-8'>
            {/* Client Metrics */}
            <section className='mb-8'>
              <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4'>
                Client Overview
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <MetricCard
                  title='Total Clients'
                  value={clientMetrics.totalClients}
                  subtitle='All time'
                />
                <MetricCard
                  title='Active Clients'
                  value={clientMetrics.activeClients}
                  subtitle='This month'
                />
                <MetricCard
                  title='Average Sessions'
                  value={clientMetrics.averageSessionsPerClient}
                  subtitle='Per client'
                />
                <MetricCard
                  title='Satisfaction Rate'
                  value={`${clientMetrics.clientSatisfactionRate}%`}
                  subtitle='Based on feedback'
                />
              </div>
            </section>

            {/* Session Stats */}
            <section className='mb-8'>
              <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4'>
                Session Metrics
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <MetricCard
                  title='Completed Sessions'
                  value={sessionStats.completedSessions}
                  subtitle='This month'
                />
                <MetricCard
                  title='Upcoming Sessions'
                  value={sessionStats.upcomingSessions}
                  subtitle='Next 7 days'
                />
                <MetricCard
                  title='Cancellation Rate'
                  value={`${sessionStats.cancellationRate}%`}
                  subtitle='Last 30 days'
                />
                <MetricCard
                  title='Average Duration'
                  value={`${sessionStats.averageSessionDuration} min`}
                  subtitle='Per session'
                />
              </div>
            </section>

            {/* Earnings Overview */}
            <section>
              <h2 className='text-xl md:text-2xl font-semibold text-gray-800 mb-4'>
                Earnings Overview
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <MetricCard
                  title='Current Month'
                  value={`$${earningsMetrics.currentMonthEarnings.toLocaleString()}`}
                  subtitle='Earnings'
                />
                <MetricCard
                  title='Previous Month'
                  value={`$${earningsMetrics.previousMonthEarnings.toLocaleString()}`}
                  subtitle='Earnings'
                />
                <MetricCard
                  title='Projected Earnings'
                  value={`$${earningsMetrics.projectedEarnings.toLocaleString()}`}
                  subtitle='Next month'
                />
                <MetricCard
                  title='Pending Payouts'
                  value={`$${earningsMetrics.pendingPayouts.toLocaleString()}`}
                  subtitle='To be processed'
                />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className='md:col-span-4'>
            <AppointmentCard />
          </div>
        </div>
      </main>
    </div>
  );
}
