'use client';

import { useUser } from '@clerk/nextjs';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

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
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(0); // 0: Welcome, 1: Permissions, 2: Connect, 3: Success/Error
  const [error, setError] = useState('');
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Fetch Google Calendar integration status
  useEffect(() => {
    async function checkGoogleCalendarStatus() {
      if (!user) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchGoogleCalendarStatus();
        if (data.success) {
          setIsConnected(data.isConnected);
          setCalendarEmail(data.calendarEmail || '');
          setLastSynced(data.lastSynced || null);
        } else {
          setIsConnected(false);
          setCalendarEmail('');
        }
      } catch {
        setError('Failed to fetch calendar status.');
      } finally {
        setIsLoading(false);
      }
    }
    checkGoogleCalendarStatus();
  }, [user]);

  // Handler for connecting Google Calendar
  const handleConnectCalendar = async () => {
    setIsLoading(true);
    setError('');
    try {
      const therapistId = user?.publicMetadata?.therapistId || (await fetchTherapistId(user?.id));
      if (!therapistId) {
        setError('Unable to find therapist ID');
        return;
      }
      await initiateGoogleCalendarConnection(Number(therapistId));
    } catch {
      setError('Failed to connect Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for disconnecting Google Calendar
  const handleDisconnectCalendar = async () => {
    setIsLoading(true);
    setError('');
    try {
      const therapistId = user?.publicMetadata?.therapistId || (await fetchTherapistId(user?.id));
      if (!therapistId) {
        setError('Unable to find therapist ID');
        return;
      }
      const success = await disconnectGoogleCalendar(Number(therapistId));
      if (success) {
        setIsConnected(false);
        setCalendarEmail('');
        setLastSynced(null);
        setStep(0);
      }
    } catch {
      setError('Failed to disconnect Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  // Stepper modal content
  const stepContent = [
    // Step 0: Welcome
    <div key='welcome' className='flex flex-col items-center text-center p-4'>
      <Image
        src='/renavestlogo.avif'
        alt='Renavest Butterfly'
        width={48}
        height={48}
        className='mb-2'
      />
      <h2 className='text-xl font-bold text-purple-700 mb-2'>Connect Google Calendar</h2>
      <p className='text-gray-600 mb-4'>
        Sync your Renavest sessions directly with your Google Calendar for seamless scheduling and
        reminders.
      </p>
      <button
        className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow mt-2 transition-colors'
        onClick={() => setStep(1)}
      >
        Get Started
      </button>
    </div>,
    // Step 1: Permissions
    <div key='permissions' className='flex flex-col items-center text-center p-4'>
      <Image src='/google-logo.svg' alt='Google Logo' width={40} height={40} className='mb-2' />
      <h2 className='text-lg font-semibold text-gray-800 mb-2'>Permissions Needed</h2>
      <p className='text-gray-600 mb-4'>
        We need permission to access your Google Calendar to sync your Renavest sessions. We only
        access your calendar for session management and never share your data.
      </p>
      <button
        className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow mt-2 transition-colors'
        onClick={() => setStep(2)}
      >
        Continue
      </button>
    </div>,
    // Step 2: Connect
    <div key='connect' className='flex flex-col items-center text-center p-4'>
      <Image src='/google-logo.svg' alt='Google Logo' width={40} height={40} className='mb-2' />
      <h2 className='text-lg font-semibold text-gray-800 mb-2'>Connect to Google</h2>
      <p className='text-gray-600 mb-4'>
        Sign in with your Google account to complete the integration.
      </p>
      <button
        onClick={handleConnectCalendar}
        disabled={isLoading}
        className='flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-6 py-2 shadow hover:bg-gray-50 transition-colors text-gray-700 font-semibold disabled:opacity-50 mb-2'
        style={{ minWidth: 220 }}
      >
        <Image src='/google-logo.svg' alt='Google' width={20} height={20} />
        {isLoading ? (
          <Loader2 className='animate-spin h-5 w-5 text-purple-600' />
        ) : (
          'Sign in with Google'
        )}
      </button>
      {error && (
        <div className='text-red-600 text-sm mt-2 flex items-center gap-1'>
          <XCircle className='h-4 w-4' /> {error}
        </div>
      )}
    </div>,
    // Step 3: Success/Error
    <div key='result' className='flex flex-col items-center text-center p-4'>
      {isConnected ? (
        <>
          <CheckCircle className='h-10 w-10 text-green-500 mb-2' />
          <h2 className='text-lg font-semibold text-green-700 mb-2'>Connected!</h2>
          <p className='text-gray-700 mb-2'>Your Google Calendar is now connected to Renavest.</p>
          {calendarEmail && (
            <p className='text-gray-600 text-sm mb-2'>
              Account: <span className='font-medium'>{calendarEmail}</span>
            </p>
          )}
          {lastSynced && <p className='text-xs text-gray-500 mb-2'>Last synced: {lastSynced}</p>}
          <button
            className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow mt-2 transition-colors'
            onClick={() => setShowModal(false)}
          >
            Done
          </button>
        </>
      ) : (
        <>
          <XCircle className='h-10 w-10 text-red-500 mb-2' />
          <h2 className='text-lg font-semibold text-red-700 mb-2'>Something went wrong</h2>
          <p className='text-gray-700 mb-2'>
            We couldn't connect your Google Calendar. Please try again.
          </p>
          <button
            className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow mt-2 transition-colors'
            onClick={() => setStep(0)}
          >
            Try Again
          </button>
        </>
      )}
    </div>,
  ];

  // Main card UI
  return (
    <div className='w-full max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden'>
      <div className='px-4 py-5 sm:px-6 flex flex-col items-center'>
        <Image
          src='/renavestlogo.avif'
          alt='Renavest Butterfly'
          width={36}
          height={36}
          className='mb-2'
        />
        <h3 className='text-lg font-semibold leading-6 text-purple-700'>
          Google Calendar Integration
        </h3>
        <p className='mt-1 max-w-2xl text-sm text-gray-500 text-center'>
          Sync your Renavest sessions directly with your Google Calendar
        </p>
      </div>
      <div className='border-t border-gray-200 px-4 py-5 sm:p-0'>
        <div className='sm:divide-y sm:divide-gray-200'>
          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <Loader2 className='animate-spin h-6 w-6 text-purple-600' />
            </div>
          ) : isConnected ? (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5 flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <Image src='/google-logo.svg' alt='Google' width={24} height={24} />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Connected Calendar</p>
                  <p className='text-sm text-gray-500'>{calendarEmail}</p>
                  {lastSynced && <p className='text-xs text-gray-400'>Last synced: {lastSynced}</p>}
                </div>
              </div>
              <div className='mt-4 sm:mt-0 sm:col-span-2 flex justify-end gap-2'>
                <button
                  onClick={() => setShowModal(true)}
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                >
                  Manage
                </button>
                <button
                  onClick={handleDisconnectCalendar}
                  disabled={isLoading}
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50'
                >
                  <XCircle className='w-4 h-4 mr-2' />
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
                onClick={() => setShowModal(true)}
                className='w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              >
                <Image
                  src='/google-logo.svg'
                  alt='Google'
                  width={20}
                  height={20}
                  className='mr-2'
                />
                Connect Google Calendar
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Modal Stepper */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
          <div className='bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative'>
            <button
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
              onClick={() => setShowModal(false)}
              aria-label='Close'
            >
              <XCircle className='h-6 w-6' />
            </button>
            {/* Stepper indicator */}
            <div className='flex justify-center mb-4 gap-2'>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${step === i ? 'bg-purple-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            {stepContent[step]}
          </div>
        </div>
      )}
    </div>
  );
}
