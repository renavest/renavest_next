'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { TherapistAvailability } from './TherapistAvailability';

interface BookingConfirmationProps {
  therapistId: number;
  therapistName: string;
  _therapistEmail: string;
  _userEmail: string;
  _userName: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

export function BookingConfirmation({
  therapistId,
  therapistName,
  _therapistEmail,
  _userEmail,
  _userName,
}: BookingConfirmationProps) {
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
      const response = await fetch('/api/bookings/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistId,
          sessionStartTime: selectedSlot.start,
          sessionEndTime: selectedSlot.end,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book session');
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Session booked successfully!');
        router.push('/dashboard');
      } else {
        throw new Error(data.message || 'Failed to book session');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to book session');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
          Book a Session with {therapistName}
        </h2>
        <p className='text-gray-600'>Select an available time slot that works best for you.</p>
      </div>

      <TherapistAvailability therapistId={therapistId} onSlotSelect={handleSlotSelect} />

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
