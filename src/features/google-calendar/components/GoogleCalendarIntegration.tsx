'use client';

import { useUser } from '@clerk/nextjs';
import { Calendar, Unlink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import {
  fetchGoogleCalendarStatus,
  initiateGoogleCalendarConnection,
  disconnectGoogleCalendar,
  fetchTherapistId,
} from '../utils/googleCalendarIntegrationHelpers';

export function GoogleCalendarIntegration() {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Google Calendar integration status
  useEffect(() => {
    async function checkGoogleCalendarStatus() {
      if (!user) return;

      setIsLoading(true);
      try {
        const data = await fetchGoogleCalendarStatus();

        if (data.success) {
          setIsConnected(data.isConnected);
          setCalendarEmail(data.calendarEmail || '');
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkGoogleCalendarStatus();
  }, [user]);

  // Handler for connecting Google Calendar
  const handleConnectCalendar = async () => {
    setIsLoading(true);
    try {
      // Fetch therapist ID if not available in publicMetadata
      const therapistId = user?.publicMetadata?.therapistId || (await fetchTherapistId(user?.id));
      if (!therapistId) {
        toast.error('Unable to find therapist ID');
        return;
      }
      await initiateGoogleCalendarConnection(Number(therapistId));
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for disconnecting Google Calendar
  const handleDisconnectCalendar = async () => {
    setIsLoading(true);
    try {
      // Fetch therapist ID if not available in publicMetadata
      const therapistId = user?.publicMetadata?.therapistId || (await fetchTherapistId(user?.id));

      if (!therapistId) {
        toast.error('Unable to find therapist ID');
        return;
      }

      const success = await disconnectGoogleCalendar(Number(therapistId));

      if (success) {
        setIsConnected(false);
        setCalendarEmail('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden'>
      <div className='px-4 py-5 sm:px-6'>
        <h3 className='text-lg font-semibold leading-6 text-gray-900'>
          Google Calendar Integration
        </h3>
        <p className='mt-1 max-w-2xl text-sm text-gray-500'>
          Sync your Renavest sessions directly with your Google Calendar
        </p>
      </div>
      <div className='border-t border-gray-200 px-4 py-5 sm:p-0'>
        <div className='sm:divide-y sm:divide-gray-200'>
          {isConnected ? (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5 flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <Calendar className='w-6 h-6 text-purple-600' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Connected Calendar</p>
                  <p className='text-sm text-gray-500'>{calendarEmail}</p>
                </div>
              </div>
              <div className='mt-4 sm:mt-0 sm:col-span-2 flex justify-end'>
                <button
                  onClick={handleDisconnectCalendar}
                  disabled={isLoading}
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50'
                >
                  <Unlink className='w-4 h-4 mr-2' />
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className='py-4 px-4 sm:px-6 text-center'>
              <p className='text-sm text-gray-600 mb-4'>
                Connect your Google Calendar to automatically add Renavest sessions
              </p>
              <button
                onClick={handleConnectCalendar}
                disabled={isLoading}
                className='w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50'
              >
                <Calendar className='w-4 h-4 mr-2' />
                Connect Google Calendar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
