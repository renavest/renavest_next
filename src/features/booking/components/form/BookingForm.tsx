'use client';

import Image from 'next/image';
import { useState } from 'react';

import { formatCurrency } from '@/src/features/therapist-dashboard/utils/dashboardHelpers';

import AlternativeBooking from '../AlternativeBooking';
import { BookingConfirmationModal } from '../BookingConfirmation/BookingConfirmationModal';
import { TherapistAvailability } from '../TherapistAvailability';
import { selectedSlotSignal } from '../TherapistAvailability/useTherapistAvailability';

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
  bookingURL: string;
  advisorEmail?: string;
  advisorPricing?: number;
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
  advisorInitials: _advisorInitials,
  bookingURL,
  advisorEmail,
  advisorPricing,
}: BookingConfirmationProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [useExternalBooking, setUseExternalBooking] = useState(false);

  const { isBooking, error, handleConfirmBooking, setError } = useBookingConfirmation(
    onConfirm,
    advisorId,
    advisorPricing,
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

  const handleGoogleCalendarUnavailable = () => {
    setUseExternalBooking(true);
  };

  if (useExternalBooking) {
    return (
      <AlternativeBooking
        advisor={{
          id: advisorId,
          name: advisorName || 'Therapist',
          profileUrl: advisorImage,
          email: advisorEmail,
        }}
        bookingURL={bookingURL}
      />
    );
  }

  // Format pricing for display
  const formattedPrice =
    advisorPricing && advisorPricing > 0 ? formatCurrency(advisorPricing) : null;

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-white py-8 px-2'>
      <div className='w-full max-w-6xl flex flex-col md:flex-row items-start justify-center gap-12'>
        {/* Left: Avatar and Header */}
        <div className='flex flex-col items-start w-full md:w-1/3 px-4 md:px-0'>
          {advisorImage && !hasImageError ? (
            <Image
              src={advisorImage}
              alt={advisorName || 'Therapist'}
              width={64}
              height={64}
              className='w-16 h-16 rounded-full object-cover shadow-md mb-4'
              onError={() => setHasImageError(true)}
            />
          ) : (
            <Image
              src='/experts/placeholderexp.png'
              alt={advisorName || 'Therapist'}
              width={64}
              height={64}
              className='w-16 h-16 rounded-full object-cover shadow-md mb-4'
            />
          )}
          <h2 className='text-2xl font-bold text-gray-900 mb-1 text-left'>
            Book a Session{advisorName ? ` with ${advisorName}` : ''}
          </h2>
          {formattedPrice && (
            <div className='mb-2'>
              <span className='text-lg font-semibold text-green-600'>{formattedPrice}</span>
              <span className='text-gray-600 text-sm ml-1'>per session</span>
            </div>
          )}
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
              onGoogleCalendarNotAvailable={handleGoogleCalendarUnavailable}
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
          advisorPricing={advisorPricing}
        />
      )}
    </div>
  );
}
