'use client';

import { fetchEmployerDashboardMetrics } from '@/src/features/employer-dashboard/actions/employerDashboardActions';
import { bookingMetricsSignal } from '@/src/features/employer-dashboard/state/employerDashboardState';
import MetricCard from '@/src/shared/components/MetricCard';

function MetricsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='space-y-8'>
      <div className='flex items-center gap-4'>
        <h2 className='text-xl md:text-2xl font-semibold text-gray-700'>{title}</h2>
        <div className='h-px flex-grow bg-purple-50' />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>{children}</div>
    </section>
  );
}

export async function BookingsSection() {
  try {
    const metrics = await fetchEmployerDashboardMetrics();
    bookingMetricsSignal.value = metrics.bookingMetrics;
    const bookingMetric = bookingMetricsSignal.value;

    return (
      <MetricsSection title='Booking Insights'>
        <MetricCard
          title='Total Bookings'
          value={bookingMetric.totalBookings}
          subtitle='All-time sessions'
          trend={+15}
        />
        <MetricCard
          title='Scheduled Bookings'
          value={bookingMetric.scheduledBookings}
          subtitle='Upcoming sessions'
          trend={+10}
        />
        <MetricCard
          title='Completed Bookings'
          value={bookingMetric.completedBookings}
          subtitle='Successful sessions'
          trend={+12}
        />
        <MetricCard
          title='Avg Bookings/Employee'
          value={bookingMetric.averageBookingsPerEmployee.toFixed(1)}
          subtitle='Session frequency'
          trend={+8}
        />
      </MetricsSection>
    );
  } catch (error) {
    console.error('Failed to load booking metrics:', error);
    return (
      <div className='bg-red-50 p-4 rounded-lg'>
        <h3 className='text-red-700 font-semibold'>Error Loading Booking Metrics</h3>
        <p className='text-red-600 text-sm mt-2'>
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}
