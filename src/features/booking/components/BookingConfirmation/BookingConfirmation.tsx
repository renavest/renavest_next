'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { TherapistAvailability } from '../TherapistAvailability';

interface BookingConfirmationProps {
  advisorId: string;
  onConfirm: (details: {
    date: string;
    startTime: string;
    therapistId: string;
    timezone: string;
  }) => Promise<{ sessionId: number; success: boolean; message: string; emailSent: boolean }>;
  advisorName?: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

export function BookingConfirmation({
  advisorId,
  onConfirm,
  advisorName,
}: BookingConfirmationProps) {
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setError(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    setError(null);
    try {
      const date = new Date(selectedSlot.start).toISOString().split('T')[0];
      const startTime = new Date(selectedSlot.start).toTimeString().split(' ')[0];
      const result = await onConfirm({
        date,
        startTime,
        therapistId: advisorId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      toast.success('Session booked successfully!');
      router.push(`/booking/confirmation?bookingId=${result.sessionId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book session');
      toast.error(error instanceof Error ? error.message : 'Failed to book session');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white py-8 px-2'>
      <div className='bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 flex flex-col items-center'>
        <div className='w-full flex flex-col items-center mb-6'>
          <div className='w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-2'>
            <span className='text-2xl font-bold text-purple-700'>R</span>
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-1'>
            Book a Session{advisorName ? ` with ${advisorName}` : ''}
          </h2>
          <p className='text-gray-600 text-center'>
            Select a date and time for your session below.
          </p>
        </div>
        <div className='w-full space-y-6'>
          <TherapistAvailability
            therapistId={parseInt(advisorId)}
            onSlotSelect={handleSlotSelect}
            selectedSlot={selectedSlot}
          />
          {selectedSlot && (
            <div className='bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col items-center mt-2'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='font-medium text-gray-900'>Selected Slot:</span>
                <span className='text-purple-700'>
                  {new Date(selectedSlot.start).toLocaleString()} -{' '}
                  {new Date(selectedSlot.end).toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className='w-full px-6 py-2 bg-purple-600 text-white rounded-md font-medium shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition'
              >
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </button>
              {error && <div className='mt-2 text-red-600 text-sm'>{error}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
