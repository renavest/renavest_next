'use client';

import { signal, computed } from '@preact-signals/safe-react';
import { Clock } from 'lucide-react';
import { DateTime } from 'luxon';
import { useEffect } from 'react';

import { TimezoneIdentifier } from '../utils/dateTimeUtils';

import { TimezoneSelect } from './BookingFormComponents/TimezoneSelect';

interface TimeSlot {
  start: string;
  end: string;
}

interface TherapistAvailabilityProps {
  therapistId: number;
  onSlotSelect: (slot: TimeSlot) => void;
  onGoogleCalendarNotAvailable?: () => void;
  selectedSlot?: TimeSlot | null;
}

// State Signals
const selectedDateSignal = signal<DateTime>(DateTime.now());
const timezoneSignal = signal<TimezoneIdentifier>('America/New_York');
const availableSlotsSignal = signal<TimeSlot[]>([]);
const loadingSignal = signal(true);
const errorSignal = signal<string | null>(null);
const isGoogleCalendarIntegratedSignal = signal(false);
const isCheckingIntegrationSignal = signal(true);

// Computed Signals
const hasAvailableSlotsSignal = computed(() => availableSlotsSignal.value.length > 0);

// Async function to check Google Calendar integration
async function checkGoogleCalendarIntegration(therapistId: number) {
  try {
    const response = await fetch(`/api/google-calendar/status?therapistId=${therapistId}`, {
      credentials: 'include',
    });

    if (response.status === 401) {
      isGoogleCalendarIntegratedSignal.value = false;
      return;
    }

    const data = await response.json();
    isGoogleCalendarIntegratedSignal.value = data.success && data.isConnected;
  } catch (err) {
    console.error('Failed to check Google Calendar integration', err);
    isGoogleCalendarIntegratedSignal.value = false;
  } finally {
    isCheckingIntegrationSignal.value = false;
  }
}

// Async function to fetch availability
async function fetchAvailability(
  therapistId: number,
  selectedDate: DateTime,
  timezone: TimezoneIdentifier,
) {
  if (!isGoogleCalendarIntegratedSignal.value) {
    loadingSignal.value = false;
    return;
  }

  loadingSignal.value = true;
  errorSignal.value = null;

  try {
    const startDate = selectedDate.startOf('day');
    const endDate = selectedDate.endOf('day');

    const response = await fetch(
      `/api/bookings/availability?` +
        `therapistId=${therapistId}&` +
        `startDate=${startDate.toISO()}&` +
        `endDate=${endDate.toISO()}&` +
        `timezone=${timezone}`,
      {
        credentials: 'include',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch availability');
    }

    const data = await response.json();
    availableSlotsSignal.value = data.slots || [];
  } catch (err) {
    console.error('Error fetching availability:', err);
    errorSignal.value = err instanceof Error ? err.message : 'Failed to fetch availability';
  } finally {
    loadingSignal.value = false;
  }
}

// Component for displaying available time slots
function AvailableSlots({
  slots,
  onSlotSelect,
  selectedSlot,
}: {
  slots: TimeSlot[];
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
}) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
      {slots.map((slot, index) => {
        const startTime = DateTime.fromISO(slot.start);
        const endTime = DateTime.fromISO(slot.end);
        const isSelected =
          selectedSlot && selectedSlot.start === slot.start && selectedSlot.end === slot.end;
        return (
          <button
            key={index}
            onClick={() => onSlotSelect(slot)}
            className={`flex items-center justify-center gap-2 p-3 border rounded-md transition-colors
              ${isSelected ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'}`}
          >
            <Clock className={`w-4 h-4 ${isSelected ? 'text-purple-700' : 'text-purple-600'}`} />
            <span className={isSelected ? 'font-semibold text-purple-800' : ''}>
              {startTime.toFormat('h:mm a')} - {endTime.toFormat('h:mm a')}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Component for date and timezone selection
function DateTimeSelector({
  selectedDate,
  timezone,
  onDateChange,
  onTimezoneChange,
}: {
  selectedDate: DateTime;
  timezone: TimezoneIdentifier;
  onDateChange: (date: string) => void;
  onTimezoneChange: (timezone: TimezoneIdentifier) => void;
}) {
  return (
    <div className='flex flex-col sm:flex-row gap-4'>
      <div className='flex-1'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Date</label>
        <input
          type='date'
          value={selectedDate.toFormat('yyyy-MM-dd')}
          onChange={(e) => onDateChange(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
        />
      </div>
      <div className='flex-1'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>Timezone</label>
        <TimezoneSelect value={timezone} onChange={onTimezoneChange} />
      </div>
    </div>
  );
}

export function TherapistAvailability({
  therapistId,
  onSlotSelect,
  onGoogleCalendarNotAvailable,
  selectedSlot,
}: TherapistAvailabilityProps) {
  // Initial integration check
  useEffect(() => {
    if (isCheckingIntegrationSignal.value) {
      checkGoogleCalendarIntegration(therapistId);
    }
    // Only run on therapistId change
  }, [therapistId]);

  // Fetch availability when dependencies change
  useEffect(() => {
    fetchAvailability(therapistId, selectedDateSignal.value, timezoneSignal.value);
    // Only run when these values change
  }, [
    therapistId,
    selectedDateSignal.value,
    timezoneSignal.value,
    isGoogleCalendarIntegratedSignal.value,
  ]);

  // Show loading state while checking integration
  if (isCheckingIntegrationSignal.value) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700'></div>
      </div>
    );
  }

  // Notify parent if Google Calendar is not available
  if (!isGoogleCalendarIntegratedSignal.value) {
    onGoogleCalendarNotAvailable?.();
    return (
      <div className='text-center space-y-4'>
        <p className='text-gray-600'>
          This therapist is not available through Google Calendar. You will be redirected to their
          booking system.
        </p>
      </div>
    );
  }

  if (errorSignal.value) {
    return <div className='p-4 bg-red-50 text-red-700 rounded-md'>{errorSignal.value}</div>;
  }

  return (
    <div className='space-y-6'>
      <DateTimeSelector
        selectedDate={selectedDateSignal.value}
        timezone={timezoneSignal.value}
        onDateChange={(dateString) => {
          selectedDateSignal.value = DateTime.fromFormat(dateString, 'yyyy-MM-dd');
        }}
        onTimezoneChange={(newTimezone) => {
          timezoneSignal.value = newTimezone;
        }}
      />

      {loadingSignal.value ? (
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700'></div>
        </div>
      ) : !hasAvailableSlotsSignal.value ? (
        <div className='text-center py-8 text-gray-500'>No available slots for this date</div>
      ) : (
        <AvailableSlots
          slots={availableSlotsSignal.value}
          onSlotSelect={onSlotSelect}
          selectedSlot={selectedSlot}
        />
      )}
    </div>
  );
}
