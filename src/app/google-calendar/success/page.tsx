'use client';

import { Calendar, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface CalendarStatus {
  isConnected: boolean;
  calendarEmail: string;
  availableSlots?: Array<{
    start: string;
    end: string;
  }>;
  error?: string;
}

function GoogleCalendarSuccessPageInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalendarStatus() {
      try {
        const therapistId = searchParams.get('therapistId');
        if (!therapistId) {
          setStatus({ isConnected: false, calendarEmail: '', error: 'Missing therapist ID' });
          return;
        }

        // Fetch calendar status
        const statusResponse = await fetch(
          `/api/google-calendar/status?therapistId=${therapistId}`,
        );
        const statusData = await statusResponse.json();

        if (!statusData.success) {
          setStatus({
            isConnected: false,
            calendarEmail: '',
            error: statusData.message || 'Failed to fetch calendar status',
          });
          return;
        }

        // Fetch next week's availability
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const availabilityResponse = await fetch(
          `/api/sessions/availability?` +
            `therapistId=${therapistId}&` +
            `startDate=${now.toISOString()}&` +
            `endDate=${oneWeekFromNow.toISOString()}&` +
            `timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
        );
        const availabilityData = await availabilityResponse.json();

        setStatus({
          isConnected: statusData.isConnected,
          calendarEmail: statusData.calendarEmail,
          availableSlots: availabilityData.slots,
        });
      } catch (error) {
        console.error('Error fetching calendar status:', error);
        setStatus({
          isConnected: false,
          calendarEmail: '',
          error: 'Failed to fetch calendar status',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCalendarStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4'>
        <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Verifying calendar connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4'>
      <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full'>
        <div className='text-center mb-8'>
          <div className='mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4'>
            <Check className='w-6 h-6 text-green-600' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Google Calendar Connected!</h1>
          <p className='text-gray-600'>
            Your Google Calendar has been successfully integrated with Renavest.
          </p>
        </div>

        {status?.error ? (
          <div className='bg-red-50 border border-red-200 rounded-md p-4 mb-6'>
            <p className='text-red-700'>{status.error}</p>
          </div>
        ) : (
          <>
            <div className='bg-gray-50 rounded-md p-4 mb-6'>
              <div className='flex items-center space-x-3 mb-2'>
                <Calendar className='w-5 h-5 text-purple-600' />
                <span className='font-medium text-gray-900'>{status?.calendarEmail}</span>
              </div>
              <p className='text-sm text-gray-600'>
                Your calendar is now synced and ready for session bookings
              </p>
            </div>

            {status?.availableSlots && status.availableSlots.length > 0 && (
              <div className='border-t border-gray-200 pt-6 mb-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                  Available Slots (Next 7 Days)
                </h2>
                <div className='space-y-2'>
                  {status.availableSlots.slice(0, 5).map((slot, index) => (
                    <div
                      key={index}
                      className='flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 p-2 rounded'
                    >
                      <Clock className='w-4 h-4 text-purple-600' />
                      <span>
                        {new Date(slot.start).toLocaleString()} -{' '}
                        {new Date(slot.end).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {status.availableSlots.length > 5 && (
                    <p className='text-sm text-gray-500 mt-2'>
                      And {status.availableSlots.length - 5} more slots available...
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className='flex justify-center'>
          <Link href='/therapist'>
            <span className='inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-md font-medium shadow hover:bg-purple-700 transition'>
              Return to Therapist
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCalendarSuccessPage() {
  return (
    <Suspense>
      <GoogleCalendarSuccessPageInner />
    </Suspense>
  );
}
