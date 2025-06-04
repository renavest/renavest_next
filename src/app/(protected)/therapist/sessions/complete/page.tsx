'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { SessionCompletionCard } from '@/src/features/therapist-dashboard/components/sessions/SessionCompletionCard';

interface CompletableSession {
  id: number;
  clientName?: string;
  sessionDate: Date;
  sessionStartTime: Date;
  sessionEndTime: Date;
  status: string;
}

export default function SessionCompletePage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<CompletableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCompletableSessions();
    }
  }, [user]);

  const fetchCompletableSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/therapist/sessions/complete');

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();

      if (data.success) {
        // Convert date strings to Date objects
        const sessionsWithDates = data.sessions.map((session: any) => ({
          ...session,
          sessionDate: new Date(session.sessionDate),
          sessionStartTime: new Date(session.sessionStartTime),
          sessionEndTime: new Date(session.sessionEndTime),
        }));
        setSessions(sessionsWithDates);
      } else {
        setError('Failed to load sessions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async (sessionId: number) => {
    try {
      const response = await fetch('/api/therapist/sessions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      const data = await response.json();

      if (data.success) {
        // Update the session status locally
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId ? { ...session, status: 'completed' } : session,
          ),
        );
      } else {
        throw new Error(data.error || 'Failed to complete session');
      }
    } catch (err) {
      console.error('Error completing session:', err);
      throw err; // Re-throw to let the component handle the error
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <div className='text-center'>
          <div className='text-lg text-gray-600'>Loading sessions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <div className='text-center'>
          <div className='text-lg text-red-600'>Error: {error}</div>
          <button
            onClick={fetchCompletableSessions}
            className='mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Session Completion</h1>
        <p className='text-gray-600'>
          Complete your finished sessions to process payments and receive your earnings.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-gray-500 text-lg'>No sessions ready for completion</div>
          <p className='text-gray-400 mt-2'>
            Sessions will appear here after they've ended and are ready for completion.
          </p>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {sessions.map((session) => (
            <SessionCompletionCard
              key={session.id}
              session={session}
              onCompleteSession={handleCompleteSession}
            />
          ))}
        </div>
      )}

      <div className='mt-12 bg-gray-50 rounded-lg p-6'>
        <h2 className='text-lg font-semibold mb-4'>How Session Completion Works</h2>
        <div className='space-y-3 text-sm text-gray-600'>
          <div className='flex items-start gap-3'>
            <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium text-xs'>
              1
            </div>
            <div>Sessions automatically appear here after their scheduled end time</div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium text-xs'>
              2
            </div>
            <div>Click "Confirm Session Completed" to process payment</div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium text-xs'>
              3
            </div>
            <div>
              Your earnings (90% of session fee) will be transferred within 2-3 business days
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium text-xs'>
              4
            </div>
            <div>Sessions auto-complete after 24 hours if not manually confirmed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
