'use client';

import { CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/src/lib/utils';
import { createDate } from '@/src/utils/timezone';

interface SessionCompletionCardProps {
  session: {
    id: number;
    clientName?: string;
    sessionDate: Date;
    sessionStartTime: Date;
    sessionEndTime: Date;
    status: string;
  };
  onCompleteSession: (sessionId: number) => Promise<void>;
  className?: string;
}

export function SessionCompletionCard({
  session,
  onCompleteSession,
  className,
}: SessionCompletionCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(session.status === 'completed');

  const handleCompleteSession = async () => {
    try {
      setIsCompleting(true);
      await onCompleteSession(session.id);
      setIsCompleted(true);
    } catch (error) {
      console.error('Failed to complete session:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'completed':
        return (
          <div className='flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs'>
            <CheckCircle className='w-3 h-3' />
            Completed
          </div>
        );
      case 'confirmed':
        return (
          <div className='flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs'>
            <Clock className='w-3 h-3' />
            Ready to Complete
          </div>
        );
      default:
        return (
          <div className='flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs'>
            <AlertCircle className='w-3 h-3' />
            Pending
          </div>
        );
    }
  };

  const canComplete = session.status === 'confirmed' && !isCompleted;
  const sessionDate = createDate(session.sessionDate).toFormat('ccc, MMM d');
  const sessionTime = `${createDate(session.sessionStartTime).toFormat('h:mm a')} - ${createDate(session.sessionEndTime).toFormat('h:mm a')}`;

  return (
    <div className={cn('bg-white rounded-xl p-6 border border-purple-100 shadow-sm', className)}>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <User className='w-5 h-5 text-purple-600' />
          <h3 className='text-lg font-semibold text-gray-800'>
            {session.clientName || 'Unknown Client'}
          </h3>
        </div>
        {getStatusBadge()}
      </div>

      <div className='space-y-2 mb-4'>
        <div className='text-sm text-gray-600'>{sessionDate}</div>
        <div className='text-sm font-medium text-purple-600'>{sessionTime}</div>
      </div>

      {canComplete && (
        <div className='bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4'>
          <div className='text-sm font-medium text-purple-900 mb-2'>Ready to Complete Session</div>
          <div className='text-sm text-purple-700 mb-3'>
            Once you confirm completion, payment will be processed and you'll receive your earnings
            within 2-3 business days.
          </div>
          <button
            onClick={handleCompleteSession}
            disabled={isCompleting}
            className='w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-sm rounded-md transition-colors font-medium'
          >
            {isCompleting ? 'Processing...' : 'Confirm Session Completed'}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 text-green-800 mb-1'>
            <CheckCircle className='w-4 h-4' />
            <span className='font-medium'>Session Completed</span>
          </div>
          <div className='text-sm text-green-700'>
            Payment has been processed. Your earnings will be transferred to your account within 2-3
            business days.
          </div>
        </div>
      )}
    </div>
  );
}
