import React from 'react';

import { formatDateTime } from '@/src/features/booking/utils/dateTimeUtils';
import { formatCentsAsCurrency } from '@/src/utils/currency';
import { createDate } from '@/src/utils/timezone';

import {
  selectedSlotSignal,
  timezoneSignal,
} from '../TherapistAvailability/useTherapistAvailability';

interface BookingConfirmationModalProps {
  error: string | null;
  isBooking: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  _advisorName?: string;
  advisorPricing?: number;
}

export function BookingConfirmationModal({
  error,
  isBooking,
  onConfirm,
  onCancel,
  _advisorName,
  advisorPricing,
}: BookingConfirmationModalProps) {
  const hasPricing = advisorPricing && advisorPricing > 0;
  const formattedPrice = hasPricing ? formatCentsAsCurrency(advisorPricing) : null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center relative'>
        <button
          className='absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold'
          onClick={onCancel}
          aria-label='Cancel'
        >
          ×
        </button>
        <div className='mb-6 text-center'>
          <div className='text-lg font-semibold text-gray-900 mb-3'>Confirm Your Booking</div>
          <div className='flex flex-col items-center'>
            {(() => {
              const start = createDate(selectedSlotSignal.value?.start, timezoneSignal.value);
              const end = createDate(selectedSlotSignal.value?.end, timezoneSignal.value);
              const formattedStart = formatDateTime(start, timezoneSignal.value);
              const formattedEnd = formatDateTime(end, timezoneSignal.value);
              return (
                <>
                  <div className='text-purple-700 font-bold text-xl mb-1'>
                    {formattedStart.date}
                  </div>
                  <div className='flex items-center justify-center text-lg text-gray-800 font-medium'>
                    {formattedStart.time} <span className='mx-2'>-</span> {formattedEnd.time}{' '}
                    {formattedStart.timezone}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Pricing Information */}
          {hasPricing && (
            <div className='mt-4 p-4 bg-gray-50 rounded-lg border'>
              <div className='text-sm text-gray-600 mb-1'>Session Cost</div>
              <div className='text-2xl font-bold text-gray-900'>{formattedPrice}</div>
              <div className='text-xs text-gray-500 mt-1'>
                Payment will be processed after session completion
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onConfirm}
          disabled={isBooking}
          className='w-full px-6 py-3 bg-purple-600 text-white rounded-md font-medium shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition mb-2'
        >
          {isBooking ? 'Booking...' : hasPricing ? 'Book & Pay Later' : 'Confirm Booking'}
        </button>

        {hasPricing && (
          <div className='text-xs text-gray-500 text-center mt-2'>
            You'll be charged {formattedPrice} after your session is completed.
            <br />
            Cancel up to 24 hours before for a full refund.
          </div>
        )}

        {error && <div className='mt-2 text-red-600 text-sm'>{error}</div>}
      </div>
    </div>
  );
}
