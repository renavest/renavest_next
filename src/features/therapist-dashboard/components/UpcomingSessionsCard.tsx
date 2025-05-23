'use client';

import { Calendar, Video } from 'lucide-react';

import { UpcomingSession } from '@/src/features/therapist-dashboard/types';
import { createDate } from '@/src/utils/timezone';

export function UpcomingSessionsCard({
  sessions,
  onSessionClick: _onSessionClick = () => {},
  title = 'Upcoming Sessions',
  showIcon = true,
}: {
  sessions: UpcomingSession[];
  onSessionClick?: (clientId: string) => void;
  title?: string;
  showIcon?: boolean;
}) {
  const formatTime = (dateTimeString: string) => {
    return createDate(dateTimeString).toFormat('h:mm a');
  };

  const formatDate = (dateTimeString: string) => {
    return createDate(dateTimeString).toFormat('ccc, MMM d');
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
          {showIcon && <Calendar className='h-5 w-5 text-purple-600' />}
          {title}
        </h3>
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
                  <p className='text-sm text-gray-500'>{formatDate(session.sessionDate)}</p>
                  <p className='text-sm font-medium text-purple-600'>
                    {formatTime(session.sessionStartTime)}
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
                      onClick={(e) => e.stopPropagation()}
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
