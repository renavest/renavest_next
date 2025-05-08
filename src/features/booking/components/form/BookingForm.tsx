'use client';

import { useState } from 'react';

import { TherapistAvailability } from '../TherapistAvailability';
import { selectedSlotSignal } from '../TherapistAvailability/useTherapistAvailability';

import { BookingConfirmationModal } from './BookingConfirmationModal';
import { useBookingConfirmation } from './useBookingConfirmation';

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
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { isBooking, error, handleConfirmBooking, setError } = useBookingConfirmation(
    onConfirm,
    advisorId,
  );

  const handleSlotSelect = (slot: TimeSlot) => {
    selectedSlotSignal.value = slot;
    setSelectedSlot(slot);
    setError(null);
    setShowModal(true);
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
            />
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {selectedSlot && showModal && (
        <BookingConfirmationModal
          error={error}
          isBooking={isBooking}
          onConfirm={handleConfirmBooking}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
