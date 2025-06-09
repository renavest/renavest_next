'use client';

import { CheckCircle, DollarSign, Loader2, AlertTriangle, XCircle, CreditCard } from 'lucide-react';
import React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { trackTherapistIntegrations } from '@/src/features/posthog/therapistTracking';

interface ConnectStatus {
  connected: boolean;
  accountId?: string;
  onboardingStatus: 'not_started' | 'pending' | 'completed';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction?: boolean;
  requirements?: string[];
}

interface StripeConnectIntegrationProps {
  therapistId: number;
}

export function StripeConnectIntegration({ therapistId }: StripeConnectIntegrationProps) {
  const [status, setStatus] = useState<ConnectStatus>({
    connected: false,
    onboardingStatus: 'not_started',
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Fetch current Connect status
  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/connect/status');
      const data = await response.json();

      if (response.ok) {
        setStatus(data);
      } else {
        console.error('Failed to fetch Connect status:', data.error);
      }
    } catch (error) {
      console.error('Error fetching Connect status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initiate Connect onboarding
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Track analytics
      if (therapistId) {
        trackTherapistIntegrations.bankConnectionAttempted(therapistId, {
          user_id: `therapist_${therapistId}`,
        });
      }

      const response = await fetch('/api/stripe/connect/oauth');
      const data = await response.json();

      if (response.ok) {
        if (data.connected) {
          // Already connected, just refresh status
          await fetchStatus();
          toast.success('Bank account already connected');
        } else if (data.url) {
          // Redirect to Stripe onboarding
          window.location.href = data.url;
        }
      } else {
        toast.error(data.error || 'Failed to initiate bank account connection');
      }
    } catch (error) {
      console.error('Error connecting bank account:', error);
      toast.error('Failed to connect bank account');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Stripe account
  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      // Track analytics
      if (therapistId) {
        trackTherapistIntegrations.bankConnectionAttempted(therapistId, {
          user_id: `therapist_${therapistId}`,
        });
      }

      const response = await fetch('/api/stripe/connect/disconnect', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        await fetchStatus();
        toast.success('Bank account disconnected successfully');
      } else {
        toast.error(data.error || 'Failed to disconnect bank account');
      }
    } catch (error) {
      console.error('Error disconnecting bank account:', error);
      toast.error('Failed to disconnect bank account');
    } finally {
      setIsConnecting(false);
      setShowDisconnectConfirm(false);
    }
  };

  // Refresh onboarding link
  const handleRefreshOnboarding = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/stripe/connect/status', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to refresh onboarding link');
      }
    } catch (error) {
      console.error('Error refreshing onboarding:', error);
      toast.error('Failed to refresh onboarding link');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Track page view
  useEffect(() => {
    if (therapistId) {
      trackTherapistIntegrations.integrationsPageViewed(therapistId, {
        user_id: `therapist_${therapistId}`,
      });
    }
  }, [therapistId]);

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <>
      <ConnectIntegrationCard
        status={status}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={() => setShowDisconnectConfirm(true)}
        onRefreshOnboarding={handleRefreshOnboarding}
      />

      {/* Disconnect Confirmation Modal */}
      {showDisconnectConfirm && (
        <DisconnectConfirmationModal
          isOpen={showDisconnectConfirm}
          onClose={() => setShowDisconnectConfirm(false)}
          onConfirm={handleDisconnect}
          isLoading={isConnecting}
        />
      )}
    </>
  );
}

// Extracted loading component
function LoadingView() {
  return (
    <div className='w-full bg-white shadow-lg rounded-xl overflow-hidden border border-purple-100'>
      <div className='px-6 py-5 flex flex-col items-center'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <CreditCard className='h-6 w-6 text-purple-700' />
          <h3 className='text-xl font-semibold leading-6 text-purple-700'>
            Bank Account Integration
          </h3>
        </div>
        <p className='mt-1 max-w-2xl text-sm text-gray-500 text-center'>
          Connect your bank account to receive payments from sessions
        </p>
      </div>
      <div className='border-t border-gray-200'>
        <div className='flex justify-center items-center py-8'>
          <Loader2 className='animate-spin h-6 w-6 text-purple-600' />
        </div>
      </div>
    </div>
  );
}

// Extracted main card component
function ConnectIntegrationCard({
  status,
  isConnecting,
  onConnect,
  onDisconnect,
  onRefreshOnboarding,
}: {
  status: ConnectStatus;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshOnboarding: () => void;
}) {
  const getStatusColor = () => {
    if (status.connected && status.payoutsEnabled) return 'text-green-600';
    if (status.connected && status.requiresAction) return 'text-amber-600';
    if (status.connected) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (status.connected && status.payoutsEnabled)
      return <CheckCircle className='h-5 w-5 text-green-500' />;
    if (status.connected && status.requiresAction)
      return <AlertTriangle className='h-5 w-5 text-amber-500' />;
    if (status.connected) return <Loader2 className='h-5 w-5 text-blue-500' />;
    return <XCircle className='h-5 w-5 text-gray-400' />;
  };

  const getStatusText = () => {
    if (status.connected && status.payoutsEnabled) return 'Connected & Ready';
    if (status.connected && status.requiresAction) return 'Action Required';
    if (status.connected) return 'Setup In Progress';
    return 'Not Connected';
  };

  return (
    <div className='w-full bg-white shadow-lg rounded-xl overflow-hidden border border-purple-100'>
      <div className='px-6 py-5 flex flex-col items-center'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <CreditCard className='h-6 w-6 text-purple-700' />
          <h3 className='text-xl font-semibold leading-6 text-purple-700'>
            Bank Account Integration
          </h3>
        </div>
        <p className='mt-1 max-w-2xl text-sm text-gray-500 text-center'>
          Connect your bank account to receive payments from sessions
        </p>
      </div>

      <div className='border-t border-gray-200'>
        <div className='px-6 py-4'>
          <StatusDisplay
            status={status}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
          <ActionSection
            status={status}
            isConnecting={isConnecting}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onRefreshOnboarding={onRefreshOnboarding}
          />
          <InfoSection />
        </div>
      </div>
    </div>
  );
}

// Status display component
function StatusDisplay({
  status,
  getStatusIcon,
  getStatusColor,
  getStatusText,
}: {
  status: ConnectStatus;
  getStatusIcon: () => React.ReactElement;
  getStatusColor: () => string;
  getStatusText: () => string;
}) {
  return (
    <>
      {/* Status Display */}
      <div className='flex items-center justify-center mb-4'>
        {getStatusIcon()}
        <span className={`ml-2 text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>
      </div>

      {/* Requirements/Issues Display */}
      {status.requiresAction && status.requirements && status.requirements.length > 0 && (
        <div className='mb-4 p-3 bg-amber-50 rounded-md border border-amber-200'>
          <h4 className='text-sm font-medium text-amber-800 mb-2'>Action Required:</h4>
          <ul className='text-xs text-amber-700 space-y-1'>
            {status.requirements.map((req, index) => (
              <li key={index} className='flex items-start'>
                <span className='mr-2'>•</span>
                <span className='capitalize'>{req.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Details */}
      {status.connected && (
        <div className='mb-4 space-y-2'>
          <div className='flex justify-between items-center text-sm'>
            <span className='text-gray-600'>Charges Enabled:</span>
            <span className={status.chargesEnabled ? 'text-green-600' : 'text-gray-400'}>
              {status.chargesEnabled ? '✓' : '○'}
            </span>
          </div>
          <div className='flex justify-between items-center text-sm'>
            <span className='text-gray-600'>Payouts Enabled:</span>
            <span className={status.payoutsEnabled ? 'text-green-600' : 'text-gray-400'}>
              {status.payoutsEnabled ? '✓' : '○'}
            </span>
          </div>
          <div className='flex justify-between items-center text-sm'>
            <span className='text-gray-600'>Details Submitted:</span>
            <span className={status.detailsSubmitted ? 'text-green-600' : 'text-gray-400'}>
              {status.detailsSubmitted ? '✓' : '○'}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// Action section component
function ActionSection({
  status,
  isConnecting,
  onConnect,
  onDisconnect,
  onRefreshOnboarding,
}: {
  status: ConnectStatus;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshOnboarding: () => void;
}) {
  if (!status.connected) {
    return (
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className='w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50'
      >
        {isConnecting ? (
          <Loader2 className='animate-spin h-4 w-4 mr-2' />
        ) : (
          <DollarSign className='h-4 w-4 mr-2' />
        )}
        {isConnecting ? 'Connecting...' : 'Connect Bank Account'}
      </button>
    );
  }

  if (status.requiresAction) {
    return (
      <div className='space-y-3'>
        <button
          onClick={onRefreshOnboarding}
          disabled={isConnecting}
          className='w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50'
        >
          {isConnecting ? (
            <Loader2 className='animate-spin h-4 w-4 mr-2' />
          ) : (
            <AlertTriangle className='h-4 w-4 mr-2' />
          )}
          {isConnecting ? 'Loading...' : 'Complete Setup'}
        </button>
        <button
          onClick={onDisconnect}
          disabled={isConnecting}
          className='w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50'
        >
          <XCircle className='h-4 w-4 mr-2' />
          Disconnect Account
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <div className='text-center'>
        <p className='text-sm text-green-600 font-medium mb-2'>
          ✓ Stripe payments configured successfully
        </p>
        <div className='text-xs text-gray-500 mb-4 space-y-1'>
          <div>• Session payments enabled</div>
          <div>• 90% revenue share active</div>
          <div>• Automatic transfers enabled</div>
        </div>
      </div>
      <button
        onClick={onDisconnect}
        disabled={isConnecting}
        className='w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50'
      >
        <XCircle className='h-4 w-4 mr-2' />
        Disconnect Account
      </button>
    </div>
  );
}

// Info section component
function InfoSection() {
  return (
    <div className='mt-4 p-3 bg-blue-50 rounded-md border border-blue-200'>
      <div className='flex items-start'>
        <DollarSign className='w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0' />
        <div className='text-xs text-blue-700'>
          <h4 className='font-medium mb-1'>Payment Information</h4>
          <ul className='space-y-1'>
            <li>• You receive 90% of session fees</li>
            <li>• Payments are transferred automatically after session completion</li>
            <li>• Standard transfer time: 2-7 business days</li>
            <li>• All transactions are handled securely through Stripe</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Disconnect confirmation modal
function DisconnectConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}
    >
      <div className='bg-white p-8 rounded-lg shadow-lg'>
        <h2 className='text-xl font-semibold mb-4'>Disconnect Bank Account</h2>
        <p className='text-base text-gray-700 mb-6'>
          Are you sure you want to disconnect your bank account? This action cannot be undone.
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50'
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      </div>
    </div>
  );
}
