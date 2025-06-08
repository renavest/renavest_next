'use client';

import { Calendar, Plus, Video } from 'lucide-react';

import { trackTherapistSessions } from '@/src/features/posthog/therapistTracking';
import { therapistIdSignal } from '@/src/features/therapist-dashboard/state/therapistDashboardState';
import { UpcomingSession } from '@/src/features/therapist-dashboard/types';
import { COLORS } from '@/src/styles/colors';
import { createDate } from '@/src/utils/timezone';

export function UpcomingSessionsCard({
  sessions,
  onSessionClick: _onSessionClick = () => {},
  title = 'Upcoming Sessions',
  showIcon = true,
  onScheduleSession,
}: {
  sessions: UpcomingSession[];
  onSessionClick?: (clientId: string) => void;
  title?: string;
  showIcon?: boolean;
  onScheduleSession?: () => void;
}) {
  const formatTime = (dateTimeString: string, timezone?: string) => {
    const tz = timezone || 'America/New_York'; // Default fallback timezone
    return createDate(dateTimeString, tz).toFormat('h:mm a');
  };

  const formatDate = (dateTimeString: string, timezone?: string) => {
    const tz = timezone || 'America/New_York'; // Default fallback timezone
    return createDate(dateTimeString, tz).toFormat('ccc, MMM d');
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
          {showIcon && <Calendar className='h-5 w-5 text-purple-600' />}
          {title}
        </h3>
        {onScheduleSession && (
          <button
            onClick={onScheduleSession}
            className={`flex items-center gap-2 px-3 py-2 ${COLORS.WARM_PURPLE.bg} text-white rounded-lg hover:${COLORS.WARM_PURPLE.hover} transition-colors text-sm font-medium`}
          >
            <Plus className='h-4 w-4' />
            Schedule Session
          </button>
        )}
      </div>
      <div className='space-y-4'>
        {sessions.length === 0 ? (
          <p className='text-gray-500 text-center'>No upcoming sessions</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className='flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-purple-50 transition-colors'
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <p className='font-medium text-gray-800'>
                    {session.clientName || 'Unknown Client'}
                  </p>
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
          ))
        )}
      </div>
    </div>
  );
}
