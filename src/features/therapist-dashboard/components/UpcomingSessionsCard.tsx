'use client';

import { Calendar } from 'lucide-react';

import { UpcomingSession } from '@/src/features/therapist-dashboard/types';
import { createDate } from '@/src/utils/timezone';
export function UpcomingSessionsCard({
  sessions,
  onSessionClick = () => {},
  title = 'Upcoming Sessions',
  showIcon = true,
}: {
  sessions: UpcomingSession[];
  onSessionClick?: (clientId: string) => void;
  title?: string;
  showIcon?: boolean;
}) {
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
              onClick={() => onSessionClick(session.clientId)}
              className='flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-purple-50 cursor-pointer transition-colors'
            >
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-medium text-gray-800'>
                    {session.clientName || 'Unknown Client'}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {createDate(session.sessionDate).toLocaleString()}
                  </p>
                </div>
                <p className='text-sm font-medium text-purple-600'>
                  {createDate(session.sessionStartTime).toLocaleString()}
                </p>
              </div>
              <p className='text-xs text-gray-600 capitalize'>{session.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
