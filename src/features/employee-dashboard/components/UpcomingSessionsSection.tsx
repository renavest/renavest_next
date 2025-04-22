'use client';

import { Calendar, Clock } from 'lucide-react';
import { DateTime } from 'luxon';
import Image from 'next/image';
import { useState, useEffect } from 'react';

type UpcomingSession = {
  id: number;
  therapistName: string;
  therapistProfileUrl: string | null;
  sessionDate: string;
  sessionStartTime: string;
  status: string;
  googleMeetLink?: string;
};

export function UpcomingSessionsSection() {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUpcomingSessions() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/employee/upcoming-sessions');

        if (!response.ok) {
          throw new Error('Failed to fetch upcoming sessions');
        }

        const data = await response.json();
        setUpcomingSessions(data.upcomingSessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUpcomingSessions();
  }, []);

  if (isLoading) {
    return (
      <section className='bg-white rounded-lg shadow-sm p-4'>
        <h2 className='text-lg font-semibold mb-4'>Upcoming Sessions</h2>
        <div className='animate-pulse space-y-3'>
          {[1, 2, 3].map((_, index) => (
            <div key={index} className='flex items-center space-x-4'>
              <div className='h-10 w-10 bg-gray-200 rounded-full'></div>
              <div className='flex-1 space-y-2'>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2'></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='bg-white rounded-lg shadow-sm p-4'>
        <h2 className='text-lg font-semibold mb-4'>Upcoming Sessions</h2>
        <p className='text-red-500'>{error}</p>
      </section>
    );
  }

  if (upcomingSessions.length === 0) {
    return (
      <section className='bg-white rounded-lg shadow-sm p-4'>
        <h2 className='text-lg font-semibold mb-4'>Upcoming Sessions</h2>
        <p className='text-gray-500'>No upcoming sessions</p>
      </section>
    );
  }

  return (
    <section className='bg-white rounded-lg shadow-sm p-4'>
      <h2 className='text-lg font-semibold mb-4'>Upcoming Sessions</h2>
      <div className='space-y-4'>
        {upcomingSessions.map((session) => {
          const sessionDateTime = DateTime.fromISO(session.sessionDate);
          const formattedDate = sessionDateTime.toFormat('MMMM dd, yyyy');
          const formattedTime = sessionDateTime.toFormat('h:mm a');

          return (
            <div
              key={session.id}
              className='flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors'
            >
              {session.therapistProfileUrl ? (
                <Image
                  src={session.therapistProfileUrl}
                  alt={`${session.therapistName}'s profile`}
                  width={40}
                  height={40}
                  className='rounded-full object-cover'
                />
              ) : (
                <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                  <span className='text-gray-500'>👤</span>
                </div>
              )}
              <div className='flex-1'>
                <h3 className='font-medium text-gray-800'>{session.therapistName}</h3>
                <div className='flex items-center space-x-2 text-gray-600 text-sm'>
                  <Calendar className='h-4 w-4' />
                  <span>{formattedDate}</span>
                  <Clock className='h-4 w-4' />
                  <span>{formattedTime}</span>
                </div>
                {session.googleMeetLink && (
                  <div className='mt-2'>
                    <a
                      href={session.googleMeetLink}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-block px-4 py-2 bg-[#9071FF] text-white rounded-full text-xs font-semibold shadow hover:bg-[#7a5fd6] transition-colors'
                    >
                      Join Google Meet
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
