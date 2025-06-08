'use client';

import { Calendar, Clock, User, X } from 'lucide-react';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { CalendarGrid } from '@/src/features/booking/components/calendar/CalendarGrid';
import { formatDateTime } from '@/src/features/booking/utils/dateTimeUtils';
import { TimezoneManager } from '@/src/features/booking/utils/timezoneManager';
import { Client } from '@/src/features/therapist-dashboard/types';
import { COLORS } from '@/src/styles/colors';
import { createDate } from '@/src/utils/timezone';

interface TimeSlot {
  start: string;
  end: string;
}

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  therapistId: number;
  onSessionScheduled: () => void;
}

export function ScheduleSessionModal({
  isOpen,
  onClose,
  client,
  therapistId,
  onSessionScheduled,
}: ScheduleSessionModalProps) {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timezoneManager = TimezoneManager.getInstance();
  const userTimezone = timezoneManager.getUserTimezone();

  // Fetch availability for the selected month
  const fetchAvailability = async (date: DateTime) => {
    setIsLoading(true);
    setError(null);
    try {
      const startDate = date.startOf('month').toISODate();
      const endDate = date.endOf('month').toISODate();

      const response = await fetch(
        `/api/sessions/availability?therapistId=${therapistId}&startDate=${startDate}&endDate=${endDate}&timezone=${userTimezone}&view=month`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setError('Failed to load availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch availability when modal opens or date changes
  useEffect(() => {
    if (isOpen) {
      const currentDate = selectedDate || DateTime.now();
      fetchAvailability(currentDate);
    }
  }, [isOpen, selectedDate, therapistId]);

  // Get available dates for calendar
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    availableSlots.forEach((slot) => {
      const slotDate = createDate(slot.start, userTimezone);
      set.add(slotDate.toISODate()!);
    });
    return set;
  }, [availableSlots, userTimezone]);

  // Get slots for selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];

    const now = DateTime.now().setZone(userTimezone);
    return availableSlots.filter((slot) => {
      const slotDateTime = createDate(slot.start, userTimezone);
      // Only include slots for the selected date
      if (slotDateTime.toISODate() !== selectedDate.toISODate()) return false;
      // If today is selected, only show future slots
      if (selectedDate.hasSame(now, 'day')) {
        return slotDateTime > now;
      }
      return true;
    });
  }, [selectedDate, availableSlots, userTimezone]);

  const handleScheduleSession = async () => {
    if (!selectedSlot || !selectedDate) {
      toast.error('Please select a date and time');
      return;
    }

    setIsScheduling(true);
    setError(null);

    try {
      const response = await fetch('/api/therapist/sessions/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: parseInt(client.id),
          sessionStartTime: selectedSlot.start,
          sessionEndTime: selectedSlot.end,
          timezone: userTimezone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule session');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Session scheduled successfully!');
        onSessionScheduled();
        onClose();
        // Reset form
        setSelectedDate(null);
        setSelectedSlot(null);
      } else {
        throw new Error(result.message || 'Failed to schedule session');
      }
    } catch (error) {
      console.error('Error scheduling session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule session';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedSlot(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-10 h-10 rounded-full ${COLORS.WARM_PURPLE.bg} flex items-center justify-center`}
            >
              <Calendar className='h-5 w-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Schedule Session</h2>
              <p className='text-sm text-gray-600'>
                Schedule a new session with {client.firstName} {client.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          >
            <X className='h-5 w-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
              {error}
            </div>
          )}

          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Calendar */}
            <div className='flex-1'>
              <div className='mb-4'>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Select Date</h3>
                <p className='text-sm text-gray-600'>Choose an available date for the session</p>
              </div>

              {isLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700'></div>
                </div>
              ) : (
                <CalendarGrid
                  selectedDate={selectedDate || DateTime.now()}
                  onDateSelect={setSelectedDate}
                  availableDates={availableDates}
                  timezone={userTimezone}
                  currentMonth={(selectedDate || DateTime.now()).startOf('month')}
                  setCurrentMonth={(date) => {
                    setSelectedDate(date);
                    fetchAvailability(date);
                  }}
                />
              )}
            </div>

            {/* Time Slots */}
            <div className='flex-1'>
              <div className='mb-4'>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Select Time</h3>
                <p className='text-sm text-gray-600'>
                  {selectedDate
                    ? `Available times for ${formatDateTime(selectedDate, userTimezone).date}`
                    : 'Select a date to see available times'}
                </p>
              </div>

              {selectedDate ? (
                <div className='space-y-2 max-h-80 overflow-y-auto'>
                  {slotsForSelectedDate.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <Clock className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                      <p>No available times for this date</p>
                    </div>
                  ) : (
                    slotsForSelectedDate.map((slot, index) => {
                      const slotDateTime = createDate(slot.start, userTimezone);
                      const isSelected = selectedSlot?.start === slot.start;

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedSlot(slot)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-150 ${
                            isSelected
                              ? `${COLORS.WARM_PURPLE.bg} text-white border-transparent`
                              : 'bg-white border-purple-200 text-gray-900 hover:border-purple-400 hover:bg-purple-50'
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            <Clock
                              className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-purple-600'}`}
                            />
                            <div>
                              <div className='font-medium'>
                                {formatDateTime(slotDateTime, userTimezone).time}
                              </div>
                              <div
                                className={`text-sm ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}
                              >
                                {formatDateTime(slotDateTime, userTimezone).timezone}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className='text-center py-8 text-gray-400'>
                  <Calendar className='h-8 w-8 mx-auto mb-2' />
                  <p>Select a date to see available times</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <User className='h-4 w-4' />
            <span>
              Client: {client.firstName} {client.lastName}
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <button
              onClick={handleClose}
              className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleSession}
              disabled={!selectedSlot || !selectedDate || isScheduling}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedSlot && selectedDate && !isScheduling
                  ? `${COLORS.WARM_PURPLE.bg} text-white hover:${COLORS.WARM_PURPLE.hover}`
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isScheduling ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Scheduling...
                </div>
              ) : (
                'Schedule Session'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
