'use client';

import React, { useState, useEffect } from 'react';
import { Clock, User, Info, Calendar, CheckCircle, Circle } from 'lucide-react';

import { formatDateTime } from '@/src/features/booking/utils/dateTimeUtils';
import { TherapistImage } from '@/src/features/therapist-dashboard/components/shared/TherapistImage';
import { createDate } from '@/src/utils/timezone';

type SessionStatus = 'available' | 'booked' | 'used';

interface Session {
  id: number;
  status: SessionStatus;
}

type UpcomingSession = {
  id: number;
  therapistName: string;
  therapistProfileUrl: string | null;
  sessionDate: string;
  sessionStartTime: string;
  status: string;
  googleMeetLink?: string;
  timezone: string;
};

const FinancialTherapySection: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, status: 'available' },
    { id: 2, status: 'available' },
    { id: 3, status: 'available' }
  ]);

  // Upcoming sessions state
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const availableSessions = sessions.filter(session => session.status === 'available').length;
  const bookedSessions = sessions.filter(session => session.status === 'booked').length;
  const usedSessions = sessions.filter(session => session.status === 'used').length;
  const totalUsed = bookedSessions - usedSessions;
  const progressPercentage = (upcomingSessions.length / 3) * 100;

  // Fetch upcoming sessions
  useEffect(() => {
    async function fetchUpcomingSessions() {
      try {
        setIsLoadingSessions(true);
        setSessionsError(null);
        const response = await fetch('/api/employee/upcoming-sessions', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch upcoming sessions');
        }

        const data = await response.json();
        setUpcomingSessions(data.upcomingSessions || []);
      } catch (err) {
        setSessionsError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoadingSessions(false);
      }
    }

    fetchUpcomingSessions();
  }, []);

  const handleBookSession = (sessionId: number) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId && session.status === 'available'
          ? { ...session, status: 'booked' }
          : session
      )
    );
  };

  const getStatusConfig = (status: SessionStatus) => {
    switch (status) {
      case 'available':
        return {
          badge: 'Available',
          badgeColor: 'bg-blue-100 text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          buttonText: 'Book Session',
          disabled: false
        };
      case 'booked':
        return {
          badge: 'Booked',
          badgeColor: 'bg-green-100 text-green-800',
          buttonColor: 'bg-green-600',
          buttonText: 'Booked',
          disabled: true
        };
      case 'used':
        return {
          badge: 'Used',
          badgeColor: 'bg-gray-100 text-gray-800',
          buttonColor: 'bg-gray-400',
          buttonText: 'Completed',
          disabled: true
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sessions History</h2>
        <p className="text-gray-600">
          You have <span className="font-semibold text-blue-600">{3 - upcomingSessions.length}</span> sessions available
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Sessions Progress</span>
          <span className="text-sm text-gray-500">{upcomingSessions.length}/3 sessions</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Session Cards */}
      {/* <div className="grid gap-4 mb-6">
        {sessions.map((session) => {
          const config = getStatusConfig(session.status);
          return (
            <div
              key={session.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between" onClick={() => handleBookSession(session.id)}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">Session {session.id}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badgeColor}`}>
                      {config.badge}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>1 hour financial therapy</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>Certified Therapist</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleBookSession(session.id)}
                  disabled={config.disabled}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 ${config.buttonColor} disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {session.status === 'booked' && <CheckCircle className="w-4 h-4" />}
                  {session.status === 'available' && <Calendar className="w-4 h-4" />}
                  {session.status === 'used' && <Circle className="w-4 h-4" />}
                  {config.buttonText}
                </button>                
              </div>
            </div>
          );
        })}
      </div> */}

      {/* Sessions History Section */}
      <div className="mt-8 mb-8">        
        {isLoadingSessions ? (
          <div className="space-y-3">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="animate-pulse flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sessionsError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">Failed to load upcoming sessions: {sessionsError}</p>
          </div>
        ) : upcomingSessions.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-gray-700 mb-2">No Upcoming Sessions</h4>
            <p className="text-sm text-gray-600">Book a session to get started with your financial therapy journey.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session) => {
              const timezone = session.timezone || 'America/New_York';
              const sessionDateTime = createDate(session.sessionDate, timezone);
              const formatted = formatDateTime(sessionDateTime, timezone);

              return (
                <div
                  key={session.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white"
                >
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        session.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : session.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : session.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
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
            })}
          </div>
        )}
      </div>

      {/* How it Works Section */}
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
    </div>
  );
};

export default FinancialTherapySection;