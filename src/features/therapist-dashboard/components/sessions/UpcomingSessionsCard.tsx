'use client';

import { Calendar, Plus, Video, User } from 'lucide-react';

import { trackTherapistSessions } from '@/src/features/posthog/therapistTracking';
import {
  therapistIdSignal,
  clientsSignal,
  openScheduleSessionModal,
} from '@/src/features/therapist-dashboard/state/therapistDashboardState';
import { UpcomingSession } from '@/src/features/therapist-dashboard/types';
import { COLORS } from '@/src/styles/colors';
import { createDate } from '@/src/utils/timezone';

export function UpcomingSessionsCard({
  sessions,
  onSessionClick: _onSessionClick = () => {},
  title = 'Upcoming Sessions',
  showIcon = true,
  showScheduleButton = true,
}: {
  sessions: UpcomingSession[];
  onSessionClick?: (clientId: string) => void;
  title?: string;
  showIcon?: boolean;
  showScheduleButton?: boolean;
}) {
  const formatTime = (dateTimeString: string, timezone?: string) => {
    const tz = timezone || 'America/New_York'; // Default fallback timezone
    return createDate(dateTimeString, tz).toFormat('h:mm a');
  };

  const formatDate = (dateTimeString: string, timezone?: string) => {
    const tz = timezone || 'America/New_York'; // Default fallback timezone
    return createDate(dateTimeString, tz).toFormat('ccc, MMM d');
  };

  const handleQuickSchedule = (clientId?: string) => {
    const clients = clientsSignal.value;

    if (clientId) {
      // Schedule with specific client
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        openScheduleSessionModal(client);
        return;
      }
    }

    // If no specific client or client not found, open with first available client
    if (clients.length > 0) {
      openScheduleSessionModal(clients[0]);
    }
  };

  const getClientForSession = (session: UpcomingSession) => {
    return clientsSignal.value.find((c) => c.id === session.clientId);
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
          {showIcon && <Calendar className='h-5 w-5 text-purple-600' />}
          {title}
        </h3>
        {showScheduleButton && (
          <div className='flex items-center gap-2'>
            {/* Quick schedule dropdown for multiple clients */}
            {clientsSignal.value.length > 1 ? (
              <div className='relative group'>
                <button
                  className={`flex items-center gap-2 px-3 py-2 ${COLORS.WARM_PURPLE.bg} text-white rounded-lg hover:${COLORS.WARM_PURPLE.hover} transition-colors text-sm font-medium`}
                >
                  <Plus className='h-4 w-4' />
                  Schedule Session
                </button>

                {/* Dropdown menu */}
                <div className='absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                  <div className='p-2'>
                    <div className='text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100'>
                      Select Client
                    </div>
                    {clientsSignal.value.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleQuickSchedule(client.id)}
                        className='w-full text-left px-3 py-2 hover:bg-purple-50 rounded-md transition-colors flex items-center gap-3'
                      >
                        <User className='h-4 w-4 text-purple-600' />
                        <div>
                          <div className='font-medium text-gray-900'>
                            {client.firstName} {client.lastName}
                          </div>
                          <div className='text-xs text-gray-500'>{client.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleQuickSchedule()}
                className={`flex items-center gap-2 px-3 py-2 ${COLORS.WARM_PURPLE.bg} text-white rounded-lg hover:${COLORS.WARM_PURPLE.hover} transition-colors text-sm font-medium`}
              >
                <Plus className='h-4 w-4' />
                Schedule Session
              </button>
            )}
          </div>
        )}
      </div>

      <div className='space-y-4'>
        {sessions.length === 0 ? (
          <div className='text-center py-8'>
            <Calendar className='h-12 w-12 mx-auto mb-3 text-gray-300' />
            <p className='text-gray-500 mb-4'>No upcoming sessions</p>
            {showScheduleButton && clientsSignal.value.length > 0 && (
              <button
                onClick={() => handleQuickSchedule()}
                className={`inline-flex items-center gap-2 px-4 py-2 ${COLORS.WARM_PURPLE.bg} text-white rounded-lg hover:${COLORS.WARM_PURPLE.hover} transition-colors text-sm font-medium`}
              >
                <Plus className='h-4 w-4' />
                Schedule Your First Session
              </button>
            )}
          </div>
        ) : (
          sessions.map((session) => {
            const client = getClientForSession(session);
            return (
              <div
                key={session.id}
                className='flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-purple-50 transition-colors group'
              >
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <p className='font-medium text-gray-800'>
                        {session.clientName || 'Unknown Client'}
                      </p>
                      {client && (
                        <button
                          onClick={() => handleQuickSchedule(client.id)}
                          className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-purple-100 rounded text-purple-600'
                          title={`Schedule another session with ${client.firstName}`}
                        >
                          <Plus className='h-3 w-3' />
                        </button>
                      )}
                    </div>
                    <p className='text-sm text-gray-500'>
                      {formatDate(session.sessionDate, session.therapistTimezone)}
                    </p>
                    <p className='text-sm font-medium text-purple-600'>
                      {formatTime(session.sessionStartTime, session.therapistTimezone)}
                      {session.therapistTimezone && (
                        <span className='text-xs text-gray-400 ml-1'>
                          ({session.therapistTimezone})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className='flex flex-col items-end gap-2'>
                    <p className='text-xs text-gray-600 capitalize'>{session.status}</p>
                    {session.googleMeetLink && (
                      <a
                        href={session.googleMeetLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors'
                        onClick={(e) => {
                          e.stopPropagation();
                          // Track session join
                          if (therapistIdSignal.value) {
                            trackTherapistSessions.sessionJoined(
                              therapistIdSignal.value,
                              parseInt(session.id, 10) || 0,
                              'google_meet',
                              { user_id: `therapist_${therapistIdSignal.value}` },
                            );
                          }
                        }}
                      >
                        <Video className='h-3 w-3' />
                        Join Meet
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
