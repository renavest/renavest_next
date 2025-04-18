'use client';

import { Clock } from 'lucide-react';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { InlineWidget } from 'react-calendly';

import { TimezoneIdentifier } from '../utils/dateTimeUtils';

import { TimezoneSelect } from './BookingFormComponents/TimezoneSelect';

interface TimeSlot {
  start: string;
  end: string;
}

interface TherapistAvailabilityProps {
  therapistId: number;
  bookingURL?: string;
  onSlotSelect: (slot: TimeSlot) => void;
}

// Custom hook for fetching availability
function useAvailability(
  therapistId: number,
  selectedDate: DateTime,
  timezone: TimezoneIdentifier,
) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleCalendarIntegrated, setIsGoogleCalendarIntegrated] = useState(false);
  const [isCheckingIntegration, setIsCheckingIntegration] = useState(true);

  useEffect(() => {
    console.log('Checking Google Calendar integration for therapist:', therapistId);

    async function checkGoogleCalendarIntegration() {
      try {
        console.log('Making request to /api/google-calendar/status');
        const response = await fetch(`/api/google-calendar/status?therapistId=${therapistId}`, {
          credentials: 'include', // Include cookies for authentication
        });
        console.log('Response status:', response.status);

        if (response.status === 401) {
          console.log('User not authenticated');
          setIsGoogleCalendarIntegrated(false);
          return;
        }

        const data = await response.json();
        console.log('Response data:', data);

        if (!data.success) {
          console.log('Integration check failed:', data.message);
          setIsGoogleCalendarIntegrated(false);
          return;
        }

        setIsGoogleCalendarIntegrated(data.isConnected);
        console.log('Set isGoogleCalendarIntegrated to:', data.isConnected);
      } catch (err) {
        console.error('Failed to check Google Calendar integration', err);
        setIsGoogleCalendarIntegrated(false);
      } finally {
        setIsCheckingIntegration(false);
      }
    }

    checkGoogleCalendarIntegration();
  }, [therapistId]);

  useEffect(() => {
    if (isCheckingIntegration) {
      return; // Wait for integration check to complete
    }

    console.log(
      'Availability effect triggered. isGoogleCalendarIntegrated:',
      isGoogleCalendarIntegrated,
    );
    if (!isGoogleCalendarIntegrated) {
      console.log('No Google Calendar integration, skipping availability fetch');
      setLoading(false);
      return;
    }

    async function fetchAvailability() {
      setLoading(true);
      setError(null);
      try {
        const startDate = selectedDate.startOf('day');
        const endDate = selectedDate.endOf('day');

        console.log('Fetching availability for:', {
          therapistId,
          startDate: startDate.toISO(),
          endDate: endDate.toISO(),
          timezone,
        });

        const response = await fetch(
          `/api/bookings/availability?` +
            `therapistId=${therapistId}&` +
            `startDate=${startDate.toISO()}&` +
            `endDate=${endDate.toISO()}&` +
            `timezone=${timezone}`,
          {
            credentials: 'include', // Include cookies for authentication
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }

        const data = await response.json();
        console.log('Availability response:', data);
        setAvailableSlots(data.slots || []);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch availability');
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [therapistId, selectedDate, timezone, isGoogleCalendarIntegrated, isCheckingIntegration]);

  return { availableSlots, loading, error, isGoogleCalendarIntegrated, isCheckingIntegration };
}

// Component for displaying available time slots
function AvailableSlots({
  slots,
  onSlotSelect,
}: {
  slots: TimeSlot[];
  onSlotSelect: (slot: TimeSlot) => void;
}) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
      {slots.map((slot, index) => {
        const startTime = DateTime.fromISO(slot.start);
        const endTime = DateTime.fromISO(slot.end);
        return (
          <button
            key={index}
            onClick={() => onSlotSelect(slot)}
            className='flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-md hover:border-purple-500 hover:bg-purple-50 transition-colors'
          >
            <Clock className='w-4 h-4 text-purple-600' />
            <span>
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
  bookingURL,
  onSlotSelect,
}: TherapistAvailabilityProps) {
  const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now());
  const [timezone, setTimezone] = useState<TimezoneIdentifier>('America/New_York');

  const { availableSlots, loading, error, isGoogleCalendarIntegrated, isCheckingIntegration } =
    useAvailability(therapistId, selectedDate, timezone);

  const handleDateChange = (dateString: string) => {
    const newDate = DateTime.fromFormat(dateString, 'yyyy-MM-dd');
    setSelectedDate(newDate);
  };

  const handleTimezoneChange = (newTimezone: TimezoneIdentifier) => {
    setTimezone(newTimezone);
  };

  // Show loading state while checking integration
  if (isCheckingIntegration) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700'></div>
      </div>
    );
  }

  // Fallback to Calendly if no Google Calendar integration
  if (!isGoogleCalendarIntegrated && bookingURL) {
    return (
      <div className='space-y-6'>
        <div className='text-center space-y-4'>
          <p className='text-gray-600'>
            This therapist uses Calendly for scheduling. Click below to book your session.
          </p>
        </div>
        <div className='h-[600px] w-full'>
          <InlineWidget
            url={bookingURL}
            styles={{
              height: '100%',
              width: '100%',
              minHeight: '600px',
            }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className='p-4 bg-red-50 text-red-700 rounded-md'>{error}</div>;
  }

  return (
    <div className='space-y-6'>
      <DateTimeSelector
        selectedDate={selectedDate}
        timezone={timezone}
        onDateChange={handleDateChange}
        onTimezoneChange={handleTimezoneChange}
      />

      {loading ? (
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700'></div>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>No available slots for this date</div>
      ) : (
        <AvailableSlots slots={availableSlots} onSlotSelect={onSlotSelect} />
      )}
    </div>
  );
}
