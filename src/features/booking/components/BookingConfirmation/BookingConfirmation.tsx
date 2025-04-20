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
  advisorImage?: string;
  advisorInitials?: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

export function BookingConfirmation({
  advisorId,
  onConfirm,
  advisorName,
  advisorImage,
  advisorInitials,
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
      <div className='bg-white rounded-2xl shadow-xl max-w-lg w-full p-0 flex flex-col items-center relative'>
        {/* Branding/Header */}
        <div className='w-full flex flex-col items-center pt-8 pb-4 border-b border-gray-100'>
          {advisorImage ? (
            <img
              src={advisorImage}
              alt={advisorName}
              className='w-16 h-16 rounded-full object-cover shadow-md mb-2'
            />
          ) : (
            <div className='w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-2 shadow-md'>
              <span className='text-2xl font-bold text-purple-700'>{advisorInitials || 'A'}</span>
            </div>
          )}
          <h2 className='text-2xl font-bold text-gray-900 mb-1'>
            Book a Session{advisorName ? ` with ${advisorName}` : ''}
          </h2>
          <p className='text-gray-600 text-center text-base'>
            Select a date and time for your session below.
          </p>
        </div>
        <div className='w-full px-6 py-6 flex flex-col gap-6'>
          {/* Date/Timezone Pickers and Slot Grid are inside TherapistAvailability */}
          <TherapistAvailability
            therapistId={parseInt(advisorId)}
            onSlotSelect={handleSlotSelect}
            selectedSlot={selectedSlot}
          />
        </div>
        {/* Sticky confirmation footer inside card */}
        {selectedSlot && (
          <div className='sticky bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-4 flex flex-col items-center z-10 rounded-b-2xl shadow-lg'>
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
  );
}
