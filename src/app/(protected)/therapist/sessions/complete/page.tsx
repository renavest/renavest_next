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
      const response = await fetch('/api/therapist/sessions/completable');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
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

      // Refresh the sessions list
      await fetchCompletableSessions();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete session';
      setError(errorMessage);
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
            onClick={() => window.location.reload()}
            className='mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4 max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Session Completion</h1>
        <p className='text-gray-600'>
          Mark your completed sessions to process payments and close out sessions.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-xl text-gray-500 mb-4'>No sessions to complete</div>
          <p className='text-gray-400'>
            Completed sessions will appear here for you to confirm and process payment.
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
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
            <div>Your earnings will be transferred within 2-3 business days</div>
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
