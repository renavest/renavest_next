'use client';

import { useUser } from '@clerk/nextjs';
import {
  CreditCard,
  Calendar,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { GoogleCalendarIntegration } from '@/src/features/google-calendar/components/GoogleCalendarIntegration';
import { useGoogleCalendarIntegration } from '@/src/features/google-calendar/utils/googleCalendarIntegration';
import { StripeConnectIntegration } from '@/src/features/stripe/components/StripeConnectIntegration';
import TherapistNavbar from '@/src/features/therapist-dashboard/components/navigation/TherapistNavbar';

type IntegrationType = 'stripe' | 'calendar' | null;

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

interface StripeStatus {
  connected: boolean;
  accountId?: string;
  onboardingStatus: 'not_started' | 'pending' | 'completed';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requiresAction?: boolean;
  requirements?: string[];
}

// Status Badge Component
function StatusBadge({
  status,
}: {
  status: 'connected' | 'pending' | 'disconnected' | 'error' | 'loading';
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-50 border-green-200',
          text: 'Connected',
        };
      case 'pending':
        return {
          icon: AlertTriangle,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          text: 'Setup Required',
        };
      case 'error':
        return { icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200', text: 'Error' };
      case 'loading':
        return {
          icon: Loader2,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          text: 'Loading...',
        };
      default:
        return {
          icon: XCircle,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          text: 'Not Connected',
        };
    }
  };

  const { icon: Icon, color, text } = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${color}`}
    >
      <Icon className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
      {text}
    </div>
  );
}

// Integration Card Components
function StripeCard({
  onClick,
  status,
  isLoading,
}: {
  onClick: () => void;
  status: StripeStatus | null;
  isLoading: boolean;
}) {
  const getCardStatus = () => {
    if (isLoading) return 'loading';
    if (!status || !status.connected) return 'disconnected';
    if (status.requiresAction) return 'pending';
    if (status.payoutsEnabled && status.chargesEnabled) return 'connected';
    return 'pending';
  };

  const cardStatus = getCardStatus();
  const isConnected = cardStatus === 'connected';

  return (
    <div
      onClick={onClick}
      className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative'
    >
      {/* Development Badge */}
      <div className='absolute top-3 right-3 bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full border border-orange-200'>
        DEV ONLY
      </div>

      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isConnected
                ? 'bg-blue-100 group-hover:bg-blue-200'
                : 'bg-gray-100 group-hover:bg-gray-200'
            }`}
          >
            <CreditCard className={`w-6 h-6 ${isConnected ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Stripe Payments</h3>
            <StatusBadge status={cardStatus} />
          </div>
        </div>
        <ChevronRight className='w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors' />
      </div>

      {isConnected ? (
        <div className='space-y-2'>
          <p className='text-gray-600 text-sm'>
            ✅ Bank account connected and ready to receive payments
          </p>
          <div className='text-xs text-gray-500'>
            • Earning 90% of session fees • Automatic transfers enabled •{' '}
            {status?.accountId && `Account ID: ${status.accountId.slice(-4)}`}
          </div>
        </div>
      ) : (
        <div className='space-y-3'>
          <p className='text-gray-600 text-sm'>
            {cardStatus === 'pending'
              ? 'Complete your bank account setup to start receiving payments'
              : 'Connect your bank account to receive payments from client sessions'}
          </p>
          <div className='space-y-1'>
            <div className='flex items-center text-xs text-gray-500'>
              <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
              <span>Keep 90% of session fees</span>
            </div>
            <div className='flex items-center text-xs text-gray-500'>
              <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
              <span>Automatic payments after sessions</span>
            </div>
            <div className='flex items-center text-xs text-gray-500'>
              <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
              <span>2-7 business day transfers</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarCard({
  onClick,
  isLoading,
  isConnected,
  calendarEmail,
}: {
  onClick: () => void;
  isLoading: boolean;
  isConnected: boolean;
  calendarEmail?: string | null;
}) {
  const getCardStatus = () => {
    if (isLoading) return 'loading';
    if (isConnected) return 'connected';
    return 'disconnected';
  };

  const cardStatus = getCardStatus();

  return (
    <div
      onClick={onClick}
      className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group'
    >
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isConnected
                ? 'bg-green-100 group-hover:bg-green-200'
                : 'bg-gray-100 group-hover:bg-gray-200'
            }`}
          >
            <Calendar className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>Google Calendar</h3>
            <StatusBadge status={cardStatus} />
          </div>
        </div>
        <ChevronRight className='w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors' />
      </div>

      {isConnected ? (
        <div className='space-y-2'>
          <p className='text-gray-600 text-sm'>✅ Calendar synced and managing your availability</p>
          <div className='text-xs text-gray-500'>
            • Connected to: {calendarEmail}• Sessions automatically added • Availability managed
          </div>
        </div>
      ) : (
        <div className='space-y-3'>
          <p className='text-gray-600 text-sm'>
            Connect your Google Calendar to automatically sync sessions and manage availability
          </p>
          <div className='space-y-1'>
            <div className='flex items-center text-xs text-gray-500'>
              <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
              <span>Automatic session sync</span>
            </div>
            <div className='flex items-center text-xs text-gray-500'>
              <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
              <span>Prevent double bookings</span>
            </div>
            <div className='flex items-center text-xs text-gray-500'>
              <div className='w-1.5 h-1.5 bg-gray-400 rounded-full mr-2'></div>
              <span>Manage working hours</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Status Header Component
function IntegrationsStatusHeader({
  stripeStatus,
  calendarConnected,
  stripeLoading,
  calendarLoading,
}: {
  stripeStatus: StripeStatus | null;
  calendarConnected: boolean;
  stripeLoading: boolean;
  calendarLoading: boolean;
}) {
  // Only consider Stripe in development mode
  const stripeConnected = isDevelopment
    ? stripeStatus?.connected && stripeStatus?.payoutsEnabled
    : false;
  const hasConnections = stripeConnected || calendarConnected;
  const hasPartialSetup =
    (isDevelopment && stripeStatus?.connected && !stripeStatus?.payoutsEnabled) ||
    (isDevelopment && stripeLoading) ||
    calendarLoading;

  if (hasConnections) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
        <div className='flex items-center gap-2 mb-2'>
          <CheckCircle className='w-5 h-5 text-green-600' />
          <span className='font-medium text-green-800'>Great! Your integrations are working</span>
        </div>
        <p className='text-green-700 text-sm'>
          Your essential tools are connected and helping streamline your practice.
        </p>
      </div>
    );
  }

  if (hasPartialSetup) {
    return (
      <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6'>
        <div className='flex items-center gap-2 mb-2'>
          <AlertTriangle className='w-5 h-5 text-amber-600' />
          <span className='font-medium text-amber-800'>Complete your setup</span>
        </div>
        <p className='text-amber-700 text-sm'>
          You're almost done! Complete the remaining steps to start receiving payments and managing
          your calendar.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
      <div className='flex items-center gap-2 mb-2'>
        <Calendar className='w-5 h-5 text-blue-600' />
        <span className='font-medium text-blue-800'>Let's get you set up</span>
      </div>
      <p className='text-blue-700 text-sm'>
        Connect your essential tools to streamline your practice
        {isDevelopment ? ' and get paid faster' : ''}.
      </p>
    </div>
  );
}

// Stripe Integration View Component
function StripeIntegrationView({ therapistId }: { therapistId: number }) {
  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar
        pageTitle='Stripe Integration'
        showBackButton={true}
        backButtonHref='/therapist/integrations'
      />

      <div className='max-w-4xl mx-auto mt-10'>
        <div className='mb-8'>
          <button
            onClick={() => window.history.back()}
            className='flex items-center text-purple-600 hover:text-purple-700 mb-4'
          >
            <ChevronRight className='w-4 h-4 mr-2 rotate-180' />
            Back to Integrations
          </button>

          {/* Development Warning */}
          <div className='bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center gap-2 mb-2'>
              <AlertTriangle className='w-5 h-5 text-orange-600' />
              <span className='font-medium text-orange-800'>Development Mode Only</span>
            </div>
            <p className='text-orange-700 text-sm'>
              Stripe payment functionality is only available in development environment. This will
              be hidden in production.
            </p>
          </div>

          <h1 className='text-3xl font-bold text-gray-900 mb-3'>Stripe Payment Integration</h1>
          <p className='text-gray-600 text-lg'>
            Connect your bank account to receive payments from client sessions.
          </p>
        </div>

        <StripeConnectIntegration therapistId={therapistId} />
      </div>
    </div>
  );
}

// Calendar Integration View Component
function CalendarIntegrationView() {
  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar
        pageTitle='Google Calendar Integration'
        showBackButton={true}
        backButtonHref='/therapist/integrations'
      />

      <div className='max-w-4xl mx-auto mt-10'>
        <div className='mb-8'>
          <button
            onClick={() => window.history.back()}
            className='flex items-center text-purple-600 hover:text-purple-700 mb-4'
          >
            <ChevronRight className='w-4 h-4 mr-2 rotate-180' />
            Back to Integrations
          </button>
          <h1 className='text-3xl font-bold text-gray-900 mb-3'>Google Calendar Integration</h1>
          <p className='text-gray-600 text-lg'>
            Sync your Renavest sessions with your Google Calendar and manage availability.
          </p>
        </div>

        <GoogleCalendarIntegration />
      </div>
    </div>
  );
}

// Main Integrations Overview Component
function IntegrationsOverview({
  stripeStatus,
  calendarConnected,
  stripeLoading,
  calendarLoading,
  calendarEmail,
  onSelectIntegration,
}: {
  stripeStatus: StripeStatus | null;
  calendarConnected: boolean;
  stripeLoading: boolean;
  calendarLoading: boolean;
  calendarEmail?: string | null;
  onSelectIntegration: (type: IntegrationType) => void;
}) {
  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar pageTitle='Integrations' showBackButton={true} backButtonHref='/therapist' />

      <div className='max-w-4xl mx-auto mt-10'>
        {/* Header with dynamic content based on connection status */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-3'>Integrations</h1>
          <IntegrationsStatusHeader
            stripeStatus={stripeStatus}
            calendarConnected={calendarConnected}
            stripeLoading={stripeLoading}
            calendarLoading={calendarLoading}
          />
        </div>

        <div
          className={`grid gap-6 ${isDevelopment ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-2xl mx-auto'}`}
        >
          {/* Stripe Integration Card - Only in Development */}
          {isDevelopment && (
            <StripeCard
              onClick={() => onSelectIntegration('stripe')}
              status={stripeStatus}
              isLoading={stripeLoading}
            />
          )}

          {/* Google Calendar Integration Card */}
          <CalendarCard
            onClick={() => onSelectIntegration('calendar')}
            isLoading={calendarLoading}
            isConnected={calendarConnected}
            calendarEmail={calendarEmail}
          />
        </div>

        {/* Coming Soon Section - only show if user has some integrations */}
        {((isDevelopment && stripeStatus?.connected) || calendarConnected) && (
          <div className='mt-12'>
            <h2 className='text-xl font-semibold text-gray-800 mb-6'>Coming Soon</h2>
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800'>Additional Integrations</h3>
                  <p className='text-gray-500 text-sm'>
                    More tools to enhance your workflow are coming soon
                  </p>
                </div>
              </div>
              <div className='grid md:grid-cols-3 gap-4 text-gray-600 text-sm'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Zoom Integration</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Microsoft Teams</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Practice Management</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Email Marketing</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Document Storage</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                  <span>Communication Tools</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const { user } = useUser();
  const [therapistId, setTherapistId] = useState<number | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>(null);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(true);

  // Get Google Calendar integration status
  const {
    status: { isConnected: calendarConnected, isLoading: calendarLoading, calendarEmail },
  } = useGoogleCalendarIntegration(therapistId || 0);

  // Get therapist ID from user metadata or API
  useEffect(() => {
    const getTherapistId = async () => {
      if (user?.publicMetadata?.therapistId) {
        setTherapistId(user.publicMetadata.therapistId as number);
      } else if (user?.id) {
        // Fallback to API call if not in metadata
        try {
          const response = await fetch('/api/therapist/profile');
          if (response.ok) {
            const data = await response.json();
            setTherapistId(data.therapist?.id || null);
          }
        } catch (error) {
          console.error('Error fetching therapist ID:', error);
        }
      }
    };

    getTherapistId();
  }, [user]);

  // Fetch Stripe status when therapistId is available - only in development
  useEffect(() => {
    const fetchStripeStatus = async () => {
      if (!therapistId || !isDevelopment) return;

      setStripeLoading(true);
      try {
        const response = await fetch('/api/stripe/connect/status');
        const data = await response.json();
        if (response.ok) {
          setStripeStatus(data);
        }
      } catch (error) {
        console.error('Error fetching Stripe status:', error);
      } finally {
        setStripeLoading(false);
      }
    };

    fetchStripeStatus();
  }, [therapistId]);

  if (selectedIntegration === 'stripe' && isDevelopment && therapistId) {
    return <StripeIntegrationView therapistId={therapistId} />;
  }

  if (selectedIntegration === 'calendar') {
    return <CalendarIntegrationView />;
  }

  // Main integrations overview page
  return (
    <IntegrationsOverview
      stripeStatus={stripeStatus}
      calendarConnected={calendarConnected || false}
      stripeLoading={stripeLoading}
      calendarLoading={calendarLoading}
      calendarEmail={calendarEmail}
      onSelectIntegration={setSelectedIntegration}
    />
  );
}
