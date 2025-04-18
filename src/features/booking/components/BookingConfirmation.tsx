'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { TherapistAvailability } from './TherapistAvailability';

interface BookingConfirmationProps {
  advisorId: string;
  onConfirm: (details: {
    date: string;
    startTime: string;
    therapistId: string;
    timezone: string;
  }) => Promise<{ sessionId: number; success: boolean; message: string; emailSent: boolean }>;
}

interface TimeSlot {
  start: string;
  end: string;
}

export function BookingConfirmation({ advisorId, onConfirm }: BookingConfirmationProps) {
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      // Convert slot to expected format
      const date = new Date(selectedSlot.start).toISOString().split('T')[0];
      const startTime = new Date(selectedSlot.start).toTimeString().split(' ')[0];

      const result = await onConfirm({
        date,
        startTime,
        therapistId: advisorId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      toast.success('Session booked successfully!');
      // Redirect to the confirmation page with the booking ID
      router.push(`/booking/confirmation?bookingId=${result.sessionId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to book session');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-semibold text-gray-900 mb-2'>Book a Session</h2>
        <p className='text-gray-600'>Select an available time slot that works best for you.</p>
      </div>

      <TherapistAvailability therapistId={parseInt(advisorId)} onSlotSelect={handleSlotSelect} />

      {selectedSlot && (
        <div className='mt-6'>
          <button
            onClick={handleConfirmBooking}
            disabled={isBooking}
            className='w-full px-4 py-2 bg-purple-600 text-white rounded-md font-medium shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition'
          >
            {isBooking ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  );
}
