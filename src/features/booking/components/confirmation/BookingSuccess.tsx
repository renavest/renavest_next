'use client';

import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BookingDetails {
  id: number;
  therapist: {
    name: string;
    email: string;
  };
  sessionDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  status: string;
}

function LoadingState() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700'></div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='text-red-600'>{message}</div>
    </div>
  );
}

function BookingDetails({ booking }: { booking: BookingDetails }) {
  const sessionDate = DateTime.fromISO(booking.sessionDate);
  const startTime = DateTime.fromISO(booking.sessionStartTime);
  const endTime = DateTime.fromISO(booking.sessionEndTime);

  return (
    <dl className='grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2'>
      <div>
        <dt className='text-sm font-medium text-gray-500'>Therapist</dt>
        <dd className='mt-1 text-sm text-gray-900'>{booking.therapist.name}</dd>
      </div>

      <div>
        <dt className='text-sm font-medium text-gray-500'>Date</dt>
        <dd className='mt-1 text-sm text-gray-900'>{sessionDate.toFormat('MMMM d, yyyy')}</dd>
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
  );
}

export function BookingSuccess({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookingDetails() {
      try {
        const response = await fetch(`/api/sessions/confirmation?bookingId=${bookingId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch booking details');
        }

        setBooking(data.booking);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookingDetails();
  }, [bookingId]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!booking) return <ErrorState message='Booking not found' />;

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
              <BookingDetails booking={booking} />
            </div>

            <div className='mt-8 flex justify-center'>
              <button
                onClick={() => router.push('/dashboard')}
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
