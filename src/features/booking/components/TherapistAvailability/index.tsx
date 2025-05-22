'use client';

import { Clock } from 'lucide-react';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { formatDateTime } from '@/src/features/booking/utils/dateTimeUtils';
import { timezoneManager } from '@/src/features/booking/utils/timezoneManager';
import { COLORS } from '@/src/styles/colors';
import { createDate } from '@/src/utils/timezone';

import { CalendarGrid } from '../calendar/CalendarGrid';

import { TimeSelectionModal } from './TimeSelectionModal';
import {
  timezoneSignal,
  availableSlotsSignal,
  errorSignal,
  isGoogleCalendarIntegratedSignal,
  isCheckingIntegrationSignal,
  checkGoogleCalendarIntegration,
  fetchAvailability,
  selectedSlotSignal,
} from './useTherapistAvailability';

interface TimeSlot {
  start: string;
  end: string;
}

interface TherapistAvailabilityProps {
  therapistId: number;
  onSlotSelect: (slot: TimeSlot) => void;
  onGoogleCalendarNotAvailable?: () => void;
}

export function TherapistAvailability({
  therapistId,
  onSlotSelect,
  onGoogleCalendarNotAvailable,
}: TherapistAvailabilityProps) {
  // Initial calendar setup
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [modalOpen, setModalOpen] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<DateTime | null>(null);

  // Integration check
  useEffect(() => {
    if (isCheckingIntegrationSignal.value) {
      checkGoogleCalendarIntegration(therapistId);
    }
  }, [therapistId]);

  // Fetch availability for the selected month
  useEffect(() => {
    if (calendarSelectedDate) {
      fetchAvailability(therapistId, calendarSelectedDate, timezoneSignal.value);
    } else {
      // Initial fetch for current month
      fetchAvailability(therapistId, DateTime.now(), timezoneSignal.value);
    }
  }, [
    therapistId,
    calendarSelectedDate,
    timezoneSignal.value,
    isGoogleCalendarIntegratedSignal.value,
  ]);

  // Gather all available slots (no filtering by current time)
  const allAvailableSlots = availableSlotsSignal.value;

  // Gather available dates (any dates that have at least one slot)
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    allAvailableSlots.forEach((slot: TimeSlot) => {
      const tz = timezoneSignal.value || 'America/New_York';
      set.add(createDate(slot.start, tz).toISODate()!);
    });
    return set;
  }, [allAvailableSlots, timezoneSignal.value]);

  // For the selected date, filter out past times only if it's today
  const now = DateTime.now().setZone(timezoneSignal.value);
  const slotsForSelectedDate = useMemo(() => {
    if (!calendarSelectedDate) return [];
    const tz = timezoneSignal.value || 'America/New_York';
    const filteredSlots = allAvailableSlots.filter((slot: TimeSlot) => {
      const slotDate = createDate(slot.start, tz);
      // Only include slots for the selected date
      if (slotDate.toISODate() !== calendarSelectedDate.toISODate()) return false;
      // If today is selected, only show future slots
      if (calendarSelectedDate.hasSame(now, 'day')) {
        return slotDate > now;
      }
      return true;
    });

    return filteredSlots;
  }, [calendarSelectedDate, allAvailableSlots, now, timezoneSignal.value]);

  // Loading state
  if (isCheckingIntegrationSignal.value) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700'></div>
      </div>
    );
  }

  // Not available via Google Calendar
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

  // Error state
  if (errorSignal.value) {
    return <div className='p-4 bg-red-50 text-red-700 rounded-md'>{errorSignal.value}</div>;
  }

  // Desktop: two-column layout with calendar and times (shown only after selection)
  if (!isMobile) {
    return (
      <div className='w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6'>
        <div className='flex flex-col md:flex-row gap-8'>
          <div className='w-full md:w-4/6'>
            <CalendarGrid
              selectedDate={calendarSelectedDate || DateTime.now()}
              onDateSelect={setCalendarSelectedDate}
              availableDates={availableDates}
              timezone={timezoneSignal.value}
              currentMonth={(calendarSelectedDate || DateTime.now()).startOf('month')}
              setCurrentMonth={(d) => {
                setCalendarSelectedDate(d);
              }}
            />
          </div>
          <div className='w-full md:w-2/6'>
            {calendarSelectedDate ? (
              <div className='flex flex-col h-full'>
                <div className='mb-4'>
                  <div className='text-xl font-semibold text-gray-800'>
                    {formatDateTime(calendarSelectedDate, timezoneSignal.value).date}
                  </div>
                  <div className='text-sm text-gray-500'>Timezone: {timezoneSignal.value}</div>
                </div>
                <div className='flex flex-col gap-2 flex-1'>
                  {slotsForSelectedDate.length === 0 ? (
                    <div className='text-gray-400 text-center py-8'>
                      No available slots for this date
                    </div>
                  ) : (
                    slotsForSelectedDate.map((slot: TimeSlot, idx: number) => {
                      const tz = timezoneSignal.value || 'America/New_York';
                      const start = createDate(slot.start, tz);
                      const isSelected =
                        selectedSlotSignal.value &&
                        selectedSlotSignal.value.start === slot.start &&
                        selectedSlotSignal.value.end === slot.end;
                      return (
                        <button
                          key={idx}
                          onClick={() => onSlotSelect(slot)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-150 font-semibold shadow-sm focus:outline-none min-w-[80px] max-w-[110px] justify-center
                            ${
                              isSelected
                                ? COLORS.WARM_PURPLE.bg + ' text-white border-transparent'
                                : 'bg-white border-2 border-purple-300 text-gray-900 hover:' +
                                  COLORS.WARM_PURPLE.hover +
                                  ' hover:border-' +
                                  COLORS.WARM_PURPLE.DEFAULT
                            }
                          `}
                        >
                          <span className='font-bold'>
                            {formatDateTime(start, timezoneSignal.value).time}{' '}
                            {formatDateTime(start, timezoneSignal.value).timezone}
                          </span>
                          {isSelected && <span className='ml-1 text-white font-bold'>✓</span>}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-full py-16 px-4 text-center'>
                <div
                  className={`w-14 h-14 rounded-full ${COLORS.WARM_PURPLE[5]} flex items-center justify-center mb-4`}
                >
                  <Clock className={`h-7 w-7 ${COLORS.WARM_PURPLE.DEFAULT}`} />
                </div>
                <h3 className='text-xl font-semibold text-gray-700 mb-2'>Select a date first</h3>
                <p className='text-gray-500'>
                  Please choose a date from the calendar to see available times.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mobile: full-screen calendar, modal for time selection
  return (
    <div className='w-full min-h-screen bg-white flex flex-col'>
      <div className='flex-1 p-2'>
        <CalendarGrid
          selectedDate={calendarSelectedDate || DateTime.now()}
          onDateSelect={(date) => {
            setCalendarSelectedDate(date);
            // Only open modal if the date has slots AND is not in the past
            const today = DateTime.now().setZone(timezoneSignal.value).startOf('day');
            if (availableDates.has(date.toISODate()!) && date.startOf('day') >= today) {
              setModalOpen(true);
            }
          }}
          availableDates={availableDates}
          timezone={timezoneSignal.value}
          currentMonth={(calendarSelectedDate || DateTime.now()).startOf('month')}
          setCurrentMonth={(d) => {
            if (calendarSelectedDate) {
              setCalendarSelectedDate(d);
            } else {
              setCalendarSelectedDate(d);
            }
          }}
        />
      </div>
      <TimeSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        slots={slotsForSelectedDate}
        date={calendarSelectedDate || DateTime.now()}
        timezone={timezoneSignal.value}
        onSlotSelect={onSlotSelect}
        selectedSlot={selectedSlotSignal.value}
      />
    </div>
  );
}
