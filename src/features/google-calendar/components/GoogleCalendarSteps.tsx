'use client';

import { CheckCircle, XCircle, Loader2, ArrowRightLeft } from 'lucide-react';
import Image from 'next/image';

import { useGoogleCalendarIntegration } from '../hooks/useGoogleCalendarIntegration';
import type {
  WelcomeStepProps,
  PermissionsStepProps,
  ConnectStepProps,
  ResultStepProps,
  ConnectedStatusProps,
  DisconnectedStatusProps,
} from '../types';

// Google icon SVG as a component
const GoogleIcon = () => (
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
export function WelcomeStep({ onNext }: WelcomeStepProps) {
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
export function PermissionsStep({ onNext }: PermissionsStepProps) {
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

// Connect step component - uses custom hook to get state and actions
export function ConnectStep({ onConnect }: Pick<ConnectStepProps, 'onConnect'>) {
  const { status, therapistId } = useGoogleCalendarIntegration();
  const isValidTherapistId = !!(therapistId && therapistId !== '0');

  return (
    <div className='flex flex-col items-center text-center p-4'>
      <Image src='/google-logo.svg' alt='Google Logo' width={40} height={40} className='mb-2' />
      <h2 className='text-lg font-semibold text-gray-800 mb-2'>Connect Your Calendar</h2>
      <p className='text-gray-600 mb-4'>
        Click the button below to securely connect your Google Calendar account.
      </p>
      {status.error && (
        <div className='mb-4 p-2 bg-red-50 rounded-md border border-red-100 w-full'>
          <p className='text-xs text-red-600'>{status.error}</p>
        </div>
      )}
      <button
        onClick={onConnect}
        disabled={status.isLoading || !isValidTherapistId}
        className='w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50'
      >
        {status.isLoading ? <Loader2 className='animate-spin h-4 w-4 mr-2' /> : <GoogleIcon />}
        {status.isLoading ? 'Connecting...' : 'Connect Google Calendar'}
      </button>
    </div>
  );
}

// Result step component - uses custom hook to get state
export function ResultStep({ onClose, onRetry }: Pick<ResultStepProps, 'onClose' | 'onRetry'>) {
  const { status } = useGoogleCalendarIntegration();
  const isConnected = !!status.isConnected;

  return (
    <div className='flex flex-col items-center text-center p-4'>
      {isConnected ? (
        <>
          <CheckCircle className='h-12 w-12 text-green-500 mb-4' />
          <h2 className='text-lg font-semibold text-gray-800 mb-2'>Successfully Connected!</h2>
          <p className='text-gray-600 mb-2'>{status.calendarEmail}</p>
          {status.lastSynced && (
            <p className='text-xs text-gray-400 mb-4'>Last synced: {status.lastSynced}</p>
          )}
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

// Connected status component - uses custom hook to get state and actions
export function ConnectedStatus() {
  const { status, actions } = useGoogleCalendarIntegration();

  return (
    <div>
      <div className='py-4 sm:px-6 flex flex-col items-center'>
        <div className='flex items-center mb-2'>
          <CheckCircle className='h-5 w-5 text-green-500 mr-2' />
          <span className='text-sm font-medium text-gray-900'>Connected</span>
        </div>
        <p className='text-sm text-gray-500 mb-2'>{status.calendarEmail}</p>
        {status.lastSynced && (
          <p className='text-xs text-gray-400 mb-2'>Last synced: {status.lastSynced}</p>
        )}
        <div className='flex gap-2 mt-2'>
          <button
            onClick={actions.reconnect}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50'
            disabled={status.isLoading}
          >
            <ArrowRightLeft className='w-4 h-4 mr-2' />
            Reconnect
          </button>
          <button
            onClick={actions.disconnect}
            disabled={status.isLoading}
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
            <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
            Manage Availability
          </a>
        </div>
      </div>
    </div>
  );
}

// Disconnected status component - uses custom hook to get state and actions
export function DisconnectedStatus() {
  const { status, actions } = useGoogleCalendarIntegration();

  return (
    <div className='py-4 px-4 sm:px-6 text-center'>
      {status.error ? (
        <div className='mb-4 p-2 bg-red-50 rounded-md border border-red-100'>
          <div className='flex items-center text-red-600 mb-1'>
            <svg className='h-4 w-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
            <span className='text-sm font-medium'>Connection Error</span>
          </div>
          <p className='text-xs text-red-600'>{status.error}</p>
        </div>
      ) : (
        <p className='text-sm text-gray-600 mb-4'>
          Connect your Google Calendar to automatically add Renavest sessions and manage your
          working hours
        </p>
      )}
      <button
        onClick={actions.connect}
        disabled={status.isLoading}
        className='w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
      >
        <GoogleIcon />
        Connect Google Calendar
      </button>
    </div>
  );
}
