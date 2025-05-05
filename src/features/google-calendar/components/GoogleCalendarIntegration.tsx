'use client';

import { useUser } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import {
  fetchGoogleCalendarStatus,
  initiateGoogleCalendarConnection,
  disconnectGoogleCalendar,
  fetchTherapistId,
} from '../utils/googleCalendarIntegrationHelpers';

// Extract the SVG icon from GoogleSignInButton for reuse
const GoogleIcon = (
  <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
    <path
      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
      fill='#4285F4'
    />
    <path
      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
      fill='#34A853'
    />
    <path
      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
      fill='#FBBC05'
    />
    <path
      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
      fill='#EA4335'
    />
    <path d='M1 1h22v22H1z' fill='none' />
  </svg>
);

// Extracted helper to reduce component length
async function checkGoogleCalendarStatusHelper(
  user: UserResource | null | undefined,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
  setIsConnected: Dispatch<SetStateAction<boolean>>,
  setCalendarEmail: Dispatch<SetStateAction<string>>,
  setLastSynced: Dispatch<SetStateAction<string | null>>,
) {
  if (!user) return;
  setIsLoading(true);
  setError('');
  try {
    const therapistId = user?.publicMetadata?.therapistId || (await fetchTherapistId(user?.id));
    if (!therapistId) {
      setError('Unable to find therapist ID');
      setIsLoading(false);
      return;
    }
    const data = await fetchGoogleCalendarStatus(Number(therapistId));
    if (data && data.success && typeof data.isConnected === 'boolean') {
      setIsConnected(data.isConnected);
      setCalendarEmail(data.calendarEmail || '');
      setLastSynced(data.lastSynced || null);
    } else {
      setIsConnected(false);
      setCalendarEmail('');
      setError('Could not determine Google Calendar connection status.');
    }
  } catch {
    setError('Failed to fetch calendar status.');
  } finally {
    setIsLoading(false);
  }
}

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
    checkGoogleCalendarStatusHelper(
      user,
      setIsLoading,
      setError,
      setIsConnected,
      setCalendarEmail,
      setLastSynced,
    );
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
        src='/renavestlogo.png'
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
        {GoogleIcon}
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
          src='/renavestlogo.png'
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
            <div className='py-4 sm:px-6 flex flex-col items-center'>
              <div className='flex items-center space-x-3 mb-2'>
                {GoogleIcon}
                <div>
                  <p className='text-sm font-medium text-gray-900'>Connected Calendar</p>
                </div>
              </div>
              <p className='text-sm text-gray-500 mb-2'>{calendarEmail}</p>
              {lastSynced && (
                <p className='text-xs text-gray-400 mb-2'>Last synced: {lastSynced}</p>
              )}
              <div className='flex gap-2 mt-2'>
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
                {GoogleIcon}
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
