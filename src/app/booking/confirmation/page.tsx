import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';

import { db } from '@/src/db';
import { bookingSessions } from '@/src/db/schema';

async function getBookingDetails(bookingId: string) {
  const booking = await db.query.bookingSessions.findFirst({
    where: (bookings, { eq }) => eq(bookings.id, parseInt(bookingId)),
    with: {
      therapist: true,
    },
  });

  if (!booking) {
    return null;
  }

  return booking;
}

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: { bookingId?: string };
}) {
  const { bookingId } = searchParams;

  if (!bookingId) {
    redirect('/dashboard');
  }

  const booking = await getBookingDetails(bookingId);

  if (!booking) {
    redirect('/dashboard');
  }

  const sessionDate = DateTime.fromJSDate(booking.sessionDate);
  const startTime = DateTime.fromJSDate(booking.sessionStartTime);
  const endTime = DateTime.fromJSDate(booking.sessionEndTime);

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white shadow sm:rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <div className='flex items-center justify-center mb-8'>
              <div className='rounded-full bg-green-100 p-3'>
                <svg
                  className='h-6 w-6 text-green-600'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path d='M5 13l4 4L19 7' />
                </svg>
              </div>
            </div>

            <h2 className='text-2xl font-bold text-center text-gray-900 mb-8'>
              Booking Confirmed!
            </h2>

            <div className='border-t border-gray-200 py-6'>
              <dl className='grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2'>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Therapist</dt>
                  <dd className='mt-1 text-sm text-gray-900'>{booking.therapist.name}</dd>
                </div>

                <div>
                  <dt className='text-sm font-medium text-gray-500'>Date</dt>
                  <dd className='mt-1 text-sm text-gray-900'>
                    {sessionDate.toFormat('MMMM d, yyyy')}
                  </dd>
                </div>

                <div>
                  <dt className='text-sm font-medium text-gray-500'>Start Time</dt>
                  <dd className='mt-1 text-sm text-gray-900'>{startTime.toFormat('h:mm a')}</dd>
                </div>

                <div>
                  <dt className='text-sm font-medium text-gray-500'>End Time</dt>
                  <dd className='mt-1 text-sm text-gray-900'>{endTime.toFormat('h:mm a')}</dd>
                </div>

                <div className='sm:col-span-2'>
                  <dt className='text-sm font-medium text-gray-500'>Status</dt>
                  <dd className='mt-1 text-sm text-gray-900'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className='mt-8 flex justify-center'>
              <a
                href='/dashboard'
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
