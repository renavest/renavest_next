'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, User, Info, Calendar, CheckCircle, Circle } from 'lucide-react';

import { formatDateTime } from '@/src/features/booking/utils/dateTimeUtils';
import { TherapistImage } from '@/src/features/therapist-dashboard/components/shared/TherapistImage';
import { createDate } from '@/src/utils/timezone';

// Types
type SessionStatus = 'available' | 'booked' | 'used';

interface Session {
  id: number;
  status: SessionStatus;
}

type UpcomingSessionStatus = 'confirmed' | 'pending' | 'scheduled' | 'cancelled';

interface UpcomingSession {
  id: number;
  therapistName: string;
  therapistProfileUrl: string | null;
  sessionDate: string;
  sessionStartTime: string;
  status: UpcomingSessionStatus;
  googleMeetLink?: string;
  timezone: string;
}

interface StatusConfig {
  badge: string;
  badgeColor: string;
  buttonColor: string;
  buttonText: string;
  disabled: boolean;
}

interface FetchUpcomingSessionsResponse {
  upcomingSessions: UpcomingSession[];
}

// Constants
const TOTAL_SESSIONS = 3;
const DEFAULT_TIMEZONE = 'America/New_York';

// Custom hooks
const useUpcomingSessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/employee/upcoming-sessions', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch upcoming sessions: ${response.status} ${response.statusText}`);
      }

      const data: FetchUpcomingSessionsResponse = await response.json();
      setUpcomingSessions(data.upcomingSessions || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching upcoming sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingSessions();
  }, [fetchUpcomingSessions]);

  return { upcomingSessions, isLoading, error, refetch: fetchUpcomingSessions };
};

// Utility functions
const getSessionStatusConfig = (status: SessionStatus): StatusConfig => {
  const configs: Record<SessionStatus, StatusConfig> = {
    available: {
      badge: 'Available',
      badgeColor: 'bg-blue-100 text-blue-800',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      buttonText: 'Book Session',
      disabled: false,
    },
    booked: {
      badge: 'Booked',
      badgeColor: 'bg-green-100 text-green-800',
      buttonColor: 'bg-green-600',
      buttonText: 'Booked',
      disabled: true,
    },
    used: {
      badge: 'Used',
      badgeColor: 'bg-gray-100 text-gray-800',
      buttonColor: 'bg-gray-400',
      buttonText: 'Completed',
      disabled: true,
    },
  };

  return configs[status];
};

const getUpcomingSessionStatusColor = (status: UpcomingSessionStatus): string => {
  const colors: Record<UpcomingSessionStatus, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return colors[status] || 'bg-gray-100 text-gray-800';
};

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Sub-components
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className="animate-pulse flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-600 text-sm">Failed to load upcoming sessions: {error}</p>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
    <h4 className="text-base font-semibold text-gray-700 mb-2">No Upcoming Sessions</h4>
    <p className="text-sm text-gray-600">Book a session to get started with your financial therapy journey.</p>
  </div>
);

interface SessionCardProps {
  session: UpcomingSession;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const timezone = session.timezone || DEFAULT_TIMEZONE;
  const sessionDateTime = createDate(session.sessionDate, timezone);
  const formatted = formatDateTime(sessionDateTime, timezone);

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white">
      {session.therapistProfileUrl ? (
        <TherapistImage
          profileUrl={session.therapistProfileUrl}
          name={session.therapistName}
          width={48}
          height={48}
          className="rounded-full flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-blue-600" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{session.therapistName}</h4>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatted.date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatted.time} {formatted.timezone}</span>
          </div>
        </div>
        
        <div className="mt-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getUpcomingSessionStatusColor(session.status)}`}>
            {capitalizeFirst(session.status)}
          </span>
        </div>
        
        {session.googleMeetLink && (
          <div className="mt-3">
            <a
              href={session.googleMeetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium transition-colors duration-200"
            >
              <Calendar className="w-3 h-3 mr-1" />
              Join Google Meet
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const HowItWorksSection: React.FC = () => (
  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
    <div className="flex items-start gap-3">
      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          Each session is a 1-hour one-on-one consultation with a certified financial therapist. 
          Our therapists help you develop healthy financial habits, overcome money-related stress, 
          and create personalized strategies for your financial wellbeing. Sessions can be booked 
          individually and used within your employment period.
        </p>
      </div>
    </div>
  </div>
);

// Main component
const FinancialTherapySection: React.FC = () => {
  const [sessions] = useState<Session[]>([
    { id: 1, status: 'available' },
    { id: 2, status: 'available' },
    { id: 3, status: 'available' },
  ]);

  const { upcomingSessions, isLoading, error } = useUpcomingSessions();

  // Memoized calculations
  const sessionStats = useMemo(() => {
    const available = sessions.filter(session => session.status === 'available').length;
    const booked = sessions.filter(session => session.status === 'booked').length;
    const used = sessions.filter(session => session.status === 'used').length;
    
    return { available, booked, used };
  }, [sessions]);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header Section */}
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sessions History</h2>
      </header>

      {/* Sessions History Section */}
      <section className="mt-8 mb-8" aria-label="Upcoming sessions">
        {isLoading && <LoadingSkeleton />}
        {error && <ErrorMessage error={error} />}
        {!isLoading && !error && upcomingSessions.length === 0 && <EmptyState />}
        {!isLoading && !error && upcomingSessions.length > 0 && (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>

      {/* How it Works Section */}
      <HowItWorksSection />
    </div>
  );
};

export default FinancialTherapySection;