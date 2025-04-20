'use client';

import { Calendar, Check, Clock, User } from 'lucide-react';
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
    <dl className='grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2'>
      <div className='flex items-center space-x-3'>
        <User className='h-6 w-6 text-purple-500' />
        <div>
          <dt className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Therapist</dt>
          <dd className='mt-1 text-base text-gray-900 font-medium'>{booking.therapist.name}</dd>
        </div>
      </div>
      <div className='flex items-center space-x-3'>
        <Calendar className='h-6 w-6 text-purple-500' />
        <div>
          <dt className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Date</dt>
          <dd className='mt-1 text-base text-gray-900 font-medium'>
            {sessionDate.toFormat('MMMM d, yyyy')}
          </dd>
        </div>
      </div>
      <div className='flex items-center space-x-3'>
        <Clock className='h-6 w-6 text-purple-500' />
        <div>
          <dt className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
            Start Time
          </dt>
          <dd className='mt-1 text-base text-gray-900 font-medium'>
            {startTime.toFormat('h:mm a')}
          </dd>
        </div>
      </div>
      <div className='flex items-center space-x-3'>
        <Clock className='h-6 w-6 text-purple-500' />
        <div>
          <dt className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>End Time</dt>
          <dd className='mt-1 text-base text-gray-900 font-medium'>{endTime.toFormat('h:mm a')}</dd>
        </div>
      </div>
      <div className='flex items-center space-x-3 sm:col-span-2'>
        <Check className='h-6 w-6 text-green-500' />
        <div>
          <dt className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Status</dt>
          <dd className='mt-1 text-base text-green-700 font-semibold'>
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100'>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </dd>
        </div>
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
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-green-50 py-16 flex items-center justify-center'>
      <div className='w-full max-w-2xl mx-auto px-4 sm:px-8'>
        <div className='bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100'>
          <div className='px-8 py-10 sm:p-12 flex flex-col items-center'>
            <div className='flex items-center justify-center mb-6'>
              <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                <Check className='h-10 w-10 text-green-600' />
              </div>
            </div>
            <h2 className='text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-4 tracking-tight'>
              Booking Confirmed!
            </h2>
            <p className='text-lg text-center text-gray-600 mb-8 max-w-md'>
              Your session has been successfully scheduled. A confirmation email has been sent with
              all the details. We look forward to seeing you!
            </p>
            <div className='w-full border-t border-gray-200 py-8'>
              <BookingDetails booking={booking} />
            </div>
            <div className='mt-10 flex justify-center w-full'>
              <button
                onClick={() => router.push('/dashboard')}
                className='inline-flex items-center px-8 py-3 border border-transparent text-lg font-semibold rounded-full shadow-lg text-white bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200'
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
