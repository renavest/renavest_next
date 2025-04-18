'use client';

import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { TimezoneSelect } from './BookingFormComponents/TimezoneSelect';

interface TimeSlot {
  start: string;
  end: string;
}

interface TherapistAvailabilityProps {
  therapistId: number;
  onSlotSelect: (slot: TimeSlot) => void;
}

export function TherapistAvailability({ therapistId, onSlotSelect }: TherapistAvailabilityProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      setError(null);
      try {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const response = await fetch(
          `/api/bookings/availability?` +
            `therapistId=${therapistId}&` +
            `startDate=${startDate.toISOString()}&` +
            `endDate=${endDate.toISOString()}&` +
            `timezone=${timezone}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }

        const data = await response.json();
        setAvailableSlots(data.slots || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch availability');
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [therapistId, selectedDate, timezone]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
  };

  if (error) {
    return <div className='p-4 bg-red-50 text-red-700 rounded-md'>{error}</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Date</label>
          <input
            type='date'
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
          />
        </div>
        <div className='flex-1'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Timezone</label>
          <TimezoneSelect value={timezone} onChange={handleTimezoneChange} />
        </div>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700'></div>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>No available slots for this date</div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
          {availableSlots.map((slot, index) => {
            const startTime = new Date(slot.start);
            const endTime = new Date(slot.end);
            return (
              <button
                key={index}
                onClick={() => onSlotSelect(slot)}
                className='flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-md hover:border-purple-500 hover:bg-purple-50 transition-colors'
              >
                <Clock className='w-4 h-4 text-purple-600' />
                <span>
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
