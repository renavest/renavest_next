'use client';

import { useUser } from '@clerk/nextjs';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  AlertTriangle,
  ArrowRightLeft,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { useGoogleCalendarIntegration, fetchTherapistId } from '../utils/googleCalendarIntegration';

// Google icon SVG
const GoogleIcon = (
  <svg className='w-5 h-5 mr-2' width='20' height='20' viewBox='0 0 48 48'>
    <path
      fill='#EA4335'
      d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
    />
    <path
      fill='#4285F4'
      d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
    />
    <path
      fill='#FBBC05'
      d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
    />
    <path
      fill='#34A853'
      d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
    />
    <path fill='none' d='M0 0h48v48H0z' />
  </svg>
);

// Welcome step component
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className='flex flex-col items-center text-center p-4'>
      <Image src='/google-logo.svg' alt='Google Logo' width={40} height={40} className='mb-2' />
      <h2 className='text-lg font-semibold text-gray-800 mb-2'>Welcome to Google Calendar</h2>
      <p className='text-gray-600 mb-4'>
        Connect your Google Calendar to automatically sync your Renavest sessions and manage your
        availability seamlessly.
      </p>
      <button
        className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow mt-2 transition-colors'
        onClick={onNext}
      >
        Get Started
      </button>
    </div>
  );
}

// Permissions step component
function PermissionsStep({ onNext }: { onNext: () => void }) {
  return (
    <div className='flex flex-col items-center text-center p-4'>
      <Image src='/google-logo.svg' alt='Google Logo' width={40} height={40} className='mb-2' />
      <h2 className='text-lg font-semibold text-gray-800 mb-2'>Permissions Needed</h2>
      <p className='text-gray-600 mb-4'>
        We need permission to access your Google Calendar to sync your Renavest sessions. We only
        access your calendar for session management and never share your data.
      </p>
      <button
        className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow mt-2 transition-colors'
        onClick={onNext}
      >
        Continue
      </button>
    </div>
  );
}

// Connect step component
function ConnectStep({
  isLoading,
  therapistId,
  error,
  onConnect,
}: {
  isLoading: boolean;
  therapistId: string | null;
  error: string | null;
  onConnect: () => void;
}) {
  return (
    <div className='flex flex-col items-center text-center p-4'>
      <Image src='/google-logo.svg' alt='Google Logo' width={40} height={40} className='mb-2' />
      <h2 className='text-lg font-semibold text-gray-800 mb-2'>Connect Your Calendar</h2>
      <p className='text-gray-600 mb-4'>
        Click the button below to securely connect your Google Calendar account.
      </p>
      {error && (
        <div className='mb-4 p-2 bg-red-50 rounded-md border border-red-100 w-full'>
          <p className='text-xs text-red-600'>{error}</p>
        </div>
      )}
      <button
        onClick={onConnect}
        disabled={isLoading || !therapistId}
        className='w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50'
      >
        {isLoading ? <Loader2 className='animate-spin h-4 w-4 mr-2' /> : GoogleIcon}
        {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
      </button>
    </div>
  );
}

// Result step component
function ResultStep({
  isConnected,
  calendarEmail,
  lastSynced,
  onClose,
  onRetry,
}: {
  isConnected: boolean;
  calendarEmail: string | null | undefined;
  lastSynced: string | null | undefined;
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div className='flex flex-col items-center text-center p-4'>
      {isConnected ? (
        <>
          <CheckCircle className='h-12 w-12 text-green-500 mb-4' />
          <h2 className='text-lg font-semibold text-gray-800 mb-2'>Successfully Connected!</h2>
          <p className='text-gray-600 mb-2'>{calendarEmail}</p>
          {lastSynced && <p className='text-xs text-gray-400 mb-4'>Last synced: {lastSynced}</p>}
          <p className='text-gray-600 mb-4'>
            Your Google Calendar is now connected. You can now manage your working hours and
            availability.
          </p>
        </>
      ) : (
        <>
          <XCircle className='h-12 w-12 text-red-500 mb-4' />
          <h2 className='text-lg font-semibold text-gray-800 mb-2'>Connection Failed</h2>
          <p className='text-gray-600 mb-4'>
            We couldn't connect your Google Calendar. Please try again.
          </p>
          <button
            onClick={onRetry}
            className='bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow mb-2 transition-colors'
          >
            Try Again
          </button>
        </>
      )}
      <button onClick={onClose} className='text-gray-500 hover:text-gray-700 font-medium text-sm'>
        Close
      </button>
    </div>
  );
}

// Connected status component
function ConnectedStatus({
  calendarEmail,
  lastSynced,
  isLoading,
  onReconnect,
  onDisconnect,
}: {
  calendarEmail: string | null | undefined;
  lastSynced: string | null | undefined;
  isLoading: boolean;
  onReconnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div>
      <div className='py-4 sm:px-6 flex flex-col items-center'>
        <div className='flex items-center mb-2'>
          <CheckCircle className='h-5 w-5 text-green-500 mr-2' />
          <span className='text-sm font-medium text-gray-900'>Connected</span>
        </div>
        <p className='text-sm text-gray-500 mb-2'>{calendarEmail}</p>
        {lastSynced && <p className='text-xs text-gray-400 mb-2'>Last synced: {lastSynced}</p>}
        <div className='flex gap-2 mt-2'>
          <button
            onClick={onReconnect}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50'
            disabled={isLoading}
          >
            <ArrowRightLeft className='w-4 h-4 mr-2' />
            Reconnect
          </button>
          <button
            onClick={onDisconnect}
            disabled={isLoading}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50'
          >
            <XCircle className='w-4 h-4 mr-2' />
            Disconnect
          </button>
        </div>
      </div>

      {/* Availability Management Link */}
      <div className='border-t border-gray-200 p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h4 className='text-md font-semibold text-gray-900 mb-1'>
              Availability & Working Hours
            </h4>
            <p className='text-sm text-gray-600'>
              Manage your working hours and blocked time slots for client bookings.
            </p>
          </div>
          <a
            href='/therapist/availability'
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
          >
            <Calendar className='w-4 h-4 mr-2' />
            Manage Availability
          </a>
        </div>
      </div>
    </div>
  );
}

// Disconnected status component
function DisconnectedStatus({
  error,
  onConnect,
  isLoading,
}: {
  error: string | null | undefined;
  onConnect: () => void;
  isLoading: boolean;
}) {
  return (
    <div className='py-4 px-4 sm:px-6 text-center'>
      {error ? (
        <div className='mb-4 p-2 bg-red-50 rounded-md border border-red-100'>
          <div className='flex items-center text-red-600 mb-1'>
            <AlertTriangle className='h-4 w-4 mr-1' />
            <span className='text-sm font-medium'>Connection Error</span>
          </div>
          <p className='text-xs text-red-600'>{error}</p>
        </div>
      ) : (
        <p className='text-sm text-gray-600 mb-4'>
          Connect your Google Calendar to automatically add Renavest sessions and manage your
          working hours
        </p>
      )}
      <button
        onClick={onConnect}
        disabled={isLoading}
        className='w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
      >
        {GoogleIcon}
        Connect Google Calendar
      </button>
    </div>
  );
}

// Main integration component
export function GoogleCalendarIntegration() {
  const { user } = useUser();
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<number>(0);

  // Get integration status and actions from our unified hook
  const {
    status: { isConnected, isLoading, calendarEmail, lastSynced, error },
    connect,
    disconnect,
    reconnect,
    refreshStatus,
  } = useGoogleCalendarIntegration(therapistId || '');

  // Ensure we have non-undefined values for our components
  const safeCalendarEmail = calendarEmail || null;
  const safeLastSynced = lastSynced || null;
  const safeError = error || null;

  // Get therapist ID on mount
  useEffect(() => {
    async function getTherapistId() {
      if (user?.id) {
        // Try to get from metadata first
        const id = user.publicMetadata?.therapistId || (await fetchTherapistId(user.id));
        setTherapistId(id ? String(id) : null);
      }
    }

    getTherapistId();
  }, [user]);

  // Handle URL params for connection status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected') === 'true') {
      // Just connected, show success step
      setShowModal(true);
      setStep(3);
      // Refresh status to get latest
      if (therapistId) {
        refreshStatus();
      }
    }
  }, [therapistId, refreshStatus]);

  // Handler functions
  const handleStartConnect = () => {
    setShowModal(true);
    setStep(0);
  };

  const handleReconnect = async () => {
    if (!therapistId) return;
    await reconnect();
  };

  const handleConnect = () => {
    if (therapistId) {
      connect();
    }
  };

  const handleDisconnect = () => {
    if (therapistId) {
      disconnect();
    }
  };

  // Stepper modal content components
  const stepContent = [
    <WelcomeStep key='welcome' onNext={() => setStep(1)} />,
    <PermissionsStep key='permissions' onNext={() => setStep(2)} />,
    <ConnectStep
      key='connect'
      isLoading={isLoading}
      therapistId={therapistId}
      error={safeError}
      onConnect={handleConnect}
    />,
    <ResultStep
      key='result'
      isConnected={!!isConnected}
      calendarEmail={safeCalendarEmail}
      lastSynced={safeLastSynced}
      onClose={() => setShowModal(false)}
      onRetry={() => setStep(0)}
    />,
  ];

  // Main card UI
  return (
    <div className='w-full bg-white shadow-lg rounded-xl overflow-hidden border border-purple-100'>
      <div className='px-6 py-5 flex flex-col items-center'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <Calendar className='h-6 w-6 text-purple-700' />
          <h3 className='text-xl font-semibold leading-6 text-purple-700'>
            Google Calendar Integration
          </h3>
        </div>
        <p className='mt-1 max-w-2xl text-sm text-gray-500 text-center'>
          Sync your Renavest sessions and manage your availability
        </p>
      </div>
      <div className='border-t border-gray-200'>
        <div className='divide-y divide-gray-200'>
          {isLoading && !isConnected ? (
            <div className='flex justify-center items-center py-8'>
              <Loader2 className='animate-spin h-6 w-6 text-purple-600' />
            </div>
          ) : isConnected && therapistId ? (
            <ConnectedStatus
              calendarEmail={safeCalendarEmail}
              lastSynced={safeLastSynced}
              isLoading={isLoading}
              onReconnect={handleReconnect}
              onDisconnect={handleDisconnect}
            />
          ) : (
            <DisconnectedStatus
              error={safeError}
              onConnect={handleStartConnect}
              isLoading={isLoading}
            />
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
