/**
 * Custom hook for Google Calendar integration
 *
 * This hook provides a clean interface for components to interact with
 * Google Calendar integration without direct context dependencies.
 */

import { useCallback } from 'react';

import { useGoogleCalendarContext } from '../context/GoogleCalendarContext';
import type {
  GoogleCalendarIntegrationState,
  GoogleCalendarActions,
  UseGoogleCalendarIntegrationReturn,
} from '../types';

/**
 * Hook for Google Calendar integration management
 *
 * @returns Object containing integration status, actions, and therapist info
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { status, actions, therapistId } = useGoogleCalendarIntegration();
 *
 *   if (status.isLoading) return <Loader />;
 *
 *   return (
 *     <div>
 *       <p>Status: {status.isConnected ? 'Connected' : 'Not Connected'}</p>
 *       <button onClick={actions.connect}>Connect</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGoogleCalendarIntegration(): UseGoogleCalendarIntegrationReturn {
  const context = useGoogleCalendarContext();

  if (!context) {
    throw new Error('useGoogleCalendarIntegration must be used within a GoogleCalendarProvider');
  }

  const { status, actions: contextActions, therapistId } = context;

  // Wrap actions with error handling and loading states
  const enhancedActions: GoogleCalendarActions = {
    connect: useCallback(async () => {
      try {
        return await contextActions.connect();
      } catch (error) {
        console.error('Failed to connect Google Calendar:', error);
        return false;
      }
    }, [contextActions.connect]),

    disconnect: useCallback(async () => {
      try {
        return await contextActions.disconnect();
      } catch (error) {
        console.error('Failed to disconnect Google Calendar:', error);
        return false;
      }
    }, [contextActions.disconnect]),

    reconnect: useCallback(async () => {
      try {
        return await contextActions.reconnect();
      } catch (error) {
        console.error('Failed to reconnect Google Calendar:', error);
        return false;
      }
    }, [contextActions.reconnect]),

    refreshStatus: useCallback(() => {
      try {
        contextActions.refreshStatus();
      } catch (error) {
        console.error('Failed to refresh Google Calendar status:', error);
      }
    }, [contextActions.refreshStatus]),
  };

  return {
    status,
    actions: enhancedActions,
    therapistId,
  };
}

/**
 * Hook for checking if Google Calendar is connected
 *
 * @returns Boolean indicating connection status, null if loading
 *
 * @example
 * ```tsx
 * function BookingButton() {
 *   const isConnected = useGoogleCalendarConnection();
 *
 *   return (
 *     <button disabled={!isConnected}>
 *       {isConnected ? 'Book Session' : 'Connect Calendar First'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useGoogleCalendarConnection(): boolean | null {
  const { status } = useGoogleCalendarIntegration();
  return status.isConnected;
}

/**
 * Hook for getting Google Calendar error state
 *
 * @returns Current error message or null if no error
 *
 * @example
 * ```tsx
 * function ErrorDisplay() {
 *   const error = useGoogleCalendarError();
 *
 *   if (!error) return null;
 *
 *   return <div className="error">{error}</div>;
 * }
 * ```
 */
export function useGoogleCalendarError(): string | null {
  const { status } = useGoogleCalendarIntegration();
  return status.error;
}

/**
 * Hook for getting Google Calendar loading state
 *
 * @returns Boolean indicating if any operation is in progress
 *
 * @example
 * ```tsx
 * function ConnectionButton() {
 *   const { actions } = useGoogleCalendarIntegration();
 *   const isLoading = useGoogleCalendarLoading();
 *
 *   return (
 *     <button onClick={actions.connect} disabled={isLoading}>
 *       {isLoading ? 'Connecting...' : 'Connect'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useGoogleCalendarLoading(): boolean {
  const { status } = useGoogleCalendarIntegration();
  return status.isLoading;
}
