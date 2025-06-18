'use client';

import { CheckCircle, Clock, AlertCircle, User, DollarSign } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/src/lib/utils';
import { formatCurrency } from '@/src/utils/currency';
import { createDate } from '@/src/utils/timezone';

import { sessionCompletionSignal, completeSession } from '../../state/therapistDashboardState';
import { SessionCompletionCardProps } from '../../types/session';

export function SessionCompletionCard({
  session,
  className,
}: Omit<SessionCompletionCardProps, 'onCompleteSession'>) {
  const [isCompleted, setIsCompleted] = useState(session.status === 'completed');
  const isCompleting = sessionCompletionSignal.value.completing.has(session.id);

  const handleCompleteSession = async () => {
    try {
      await completeSession(session.id);
      setIsCompleted(true);
    } catch (error) {
      console.error('Failed to complete session:', error);
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

  // Calculate earnings if payment is required
  const sessionEarnings =
    session.paymentRequired && session.hourlyRateCents
      ? (session.hourlyRateCents * 0.9) / 100 // 90% to therapist
      : 0;

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
        {session.paymentRequired && sessionEarnings > 0 && (
          <div className='flex items-center gap-1 text-sm font-medium text-green-600'>
            <DollarSign className='w-4 h-4' />
            <span>You'll earn {formatCurrency(sessionEarnings)}</span>
          </div>
        )}
      </div>

      {canComplete && (
        <div className='bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4'>
          <div className='text-sm font-medium text-purple-900 mb-2'>Ready to Complete Session</div>
          <div className='text-sm text-purple-700 mb-3'>
            {session.paymentRequired
              ? "Once you confirm completion, payment will be processed and you'll receive your earnings within 2-3 business days."
              : 'Mark this session as completed to close it out.'}
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
            {session.paymentRequired
              ? 'Payment has been processed. Your earnings will be transferred to your account within 2-3 business days.'
              : 'Session has been marked as completed.'}
          </div>
        </div>
      )}
    </div>
  );
}
