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

export function BookingForm({
  advisorId,
  onConfirm,
  advisorName,
  advisorImage,
  advisorInitials,
}: BookingConfirmationProps) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setError(null);
    setShowModal(true);
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
      // Trigger Google Calendar event creation if booking succeeded
      if (result.success && result.sessionId) {
        fetch('/api/google-calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingSessionId: result.sessionId }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              toast.error(data.message || 'Failed to create Google Calendar event');
            }
          })
          .catch(() => {
            toast.error('Failed to create Google Calendar event');
          });
      }
      router.push(`/booking/confirmation?bookingId=${result.sessionId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book session');
      toast.error(error instanceof Error ? error.message : 'Failed to book session');
    } finally {
      setIsBooking(false);
      setShowModal(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white py-8 px-2'>
      <div className='w-full max-w-6xl flex flex-col md:flex-row items-start justify-center gap-12'>
        {/* Left: Avatar and Header */}
        <div className='flex flex-col items-start w-full md:w-1/3 px-4 md:px-0'>
          {advisorImage ? (
            <img
              src={advisorImage}
              alt={advisorName}
              className='w-16 h-16 rounded-full object-cover shadow-md mb-4'
            />
          ) : (
            <div className='w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 shadow-md'>
              <span className='text-2xl font-bold text-purple-700'>{advisorInitials || 'A'}</span>
            </div>
          )}
          <h2 className='text-2xl font-bold text-gray-900 mb-1 text-left'>
            Book a Session{advisorName ? ` with ${advisorName}` : ''}
          </h2>
          <p className='text-gray-600 text-left text-base'>
            Select a date and time for your session below.
          </p>
        </div>
        {/* Divider for desktop */}
        <div className='hidden md:block h-full border-l border-gray-200 mx-2'></div>
        {/* Right: Calendar and Time Selection */}
        <div className='w-full md:w-2/3 flex flex-col items-center'>
          <div className='w-full max-w-3xl'>
            <TherapistAvailability
              therapistId={parseInt(advisorId)}
              onSlotSelect={handleSlotSelect}
              selectedSlot={selectedSlot}
            />
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {selectedSlot && showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center relative'>
            <button
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold'
              onClick={handleCancel}
              aria-label='Cancel'
            >
              ×
            </button>
            <div className='mb-4 text-center'>
              <div className='text-lg font-semibold text-gray-900 mb-2'>Confirm Your Booking</div>
              <div className='text-purple-700 font-bold text-xl'>
                {new Date(selectedSlot.start).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                ,
                {new Date(selectedSlot.start).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                -
                {new Date(selectedSlot.end).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <button
              onClick={handleConfirmBooking}
              disabled={isBooking}
              className='w-full px-6 py-2 bg-purple-600 text-white rounded-md font-medium shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition mb-2'
            >
              {isBooking ? 'Booking...' : 'Confirm Booking'}
            </button>
            {error && <div className='mt-2 text-red-600 text-sm'>{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
