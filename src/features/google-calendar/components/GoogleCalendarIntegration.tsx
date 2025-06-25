'use client';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { GoogleCalendarProvider } from '../context/GoogleCalendarContext';
import { useGoogleCalendarIntegration } from '../hooks/useGoogleCalendarIntegration';

import { ConnectedStatus, DisconnectedStatus } from './GoogleCalendarSteps';

// Main integration component that uses the custom hook
function GoogleCalendarIntegrationContent() {
  const { status } = useGoogleCalendarIntegration();

  return (
    <div className='bg-white overflow-hidden shadow rounded-lg'>
      <div className='px-4 py-5 sm:p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>Google Calendar Integration</h3>
            <p className='mt-1 text-sm text-gray-500'>
              Connect your Google Calendar to automatically sync Renavest sessions and manage your
              availability.
            </p>
          </div>

          {/* Status Icon */}
          <div className='flex-shrink-0'>
            {status.isLoading ? (
              <Loader2 className='h-6 w-6 text-gray-400 animate-spin' />
            ) : status.isConnected ? (
              <CheckCircle className='h-6 w-6 text-green-500' />
            ) : (
              <XCircle className='h-6 w-6 text-red-500' />
            )}
          </div>
        </div>

        {/* Dynamic Status Content */}
        <div className='mt-4'>
          {status.isConnected === null ? (
            <div className='text-sm text-gray-500'>Checking connection status...</div>
          ) : status.isConnected ? (
            <div>
              <div className='text-sm text-green-600 font-medium mb-1'>
                ✓ Connected to Google Calendar
              </div>
              {status.calendarEmail && (
                <div className='text-sm text-gray-500'>Email: {status.calendarEmail}</div>
              )}
              {status.lastSynced && (
                <div className='text-xs text-gray-400'>Last synced: {status.lastSynced}</div>
              )}
            </div>
          ) : (
            <div>
              <div className='text-sm text-red-600 font-medium mb-1'>Not Connected</div>
              {status.error && <div className='text-xs text-red-500'>{status.error}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Render appropriate status component based on connection */}
      {status.isConnected ? <ConnectedStatus /> : <DisconnectedStatus />}
    </div>
  );
}

// Main export component with optional props for backward compatibility
interface GoogleCalendarIntegrationProps {
  therapistId?: number;
}

// Wrapper component that provides context
export default function GoogleCalendarIntegration(props: GoogleCalendarIntegrationProps = {}) {
  return (
    <GoogleCalendarProvider initialTherapistId={props.therapistId}>
      <GoogleCalendarIntegrationContent />
    </GoogleCalendarProvider>
  );
}

// Export the named function for backward compatibility
export { GoogleCalendarIntegration };
