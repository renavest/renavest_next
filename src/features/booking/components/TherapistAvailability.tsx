'use client';

import { signal } from '@preact-signals/safe-react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateTime, Info } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { COLORS } from '@/src/styles/colors';

import { TimezoneIdentifier } from '../utils/dateTimeUtils';

// State Signals
const selectedDateSignal = signal<DateTime>(DateTime.now());
const timezoneSignal = signal<TimezoneIdentifier>('America/New_York');
const availableSlotsSignal = signal<TimeSlot[]>([]);
const loadingSignal = signal(true);
const errorSignal = signal<string | null>(null);
const isGoogleCalendarIntegratedSignal = signal(false);
const isCheckingIntegrationSignal = signal(true);

// Types for signals and props
type SignalType<T> = { value: T };
type TimeSlotSignal = SignalType<TimeSlot[]>;
type DateTimeSignal = SignalType<DateTime>;
type TimezoneSignalType = SignalType<TimezoneIdentifier>;

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
    // Update to fetch the entire month's availability
    const startDate = selectedDate.startOf('month');
    const endDate = selectedDate.endOf('month');

    const response = await fetch(
      `/api/sessions/availability?` +
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

// Calendar grid component
function CalendarGrid({
  selectedDate,
  onDateSelect,
  availableDates,
  timezone,
  currentMonth,
  setCurrentMonth,
}: {
  selectedDate: DateTime;
  onDateSelect: (date: DateTime) => void;
  availableDates: Set<string>; // ISO date strings
  timezone: string;
  currentMonth: DateTime;
  setCurrentMonth: (date: DateTime) => void;
}) {
  const today = DateTime.now().setZone(timezone);
  const daysInMonth = currentMonth.daysInMonth || 31;
  const firstDayOfWeek = currentMonth.startOf('month').weekday % 7; // 0=Sunday
  const days: Array<DateTime | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(currentMonth.set({ day: d }));
  }

  // Helper: is available
  const isAvailable = (date: DateTime) => availableDates.has(date.toISODate()!);

  return (
    <div className='w-full bg-white rounded-xl p-6 mb-4'>
      <div className='flex items-center justify-between mb-6'>
        <button
          className='p-2 rounded-full hover:bg-gray-100 transition'
          onClick={() => setCurrentMonth(currentMonth.minus({ months: 1 }))}
          aria-label='Previous month'
        >
          <ChevronLeft className='w-5 h-5 text-gray-500' />
        </button>
        <div className='font-semibold text-xl text-gray-800'>
          {currentMonth.toFormat('MMMM yyyy')}
        </div>
        <button
          className='p-2 rounded-full hover:bg-gray-100 transition'
          onClick={() => setCurrentMonth(currentMonth.plus({ months: 1 }))}
          aria-label='Next month'
        >
          <ChevronRight className='w-5 h-5 text-gray-500' />
        </button>
      </div>
      <div className='grid grid-cols-7 gap-2 text-sm text-center font-medium text-gray-500 mb-2'>
        {Info.weekdays('short').map((wd: string) => (
          <div key={wd} className='py-2'>
            {wd}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-2'>
        {days.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;
          const isToday = date.hasSame(today, 'day');
          const isSelected = date.hasSame(selectedDate, 'day');
          const available = isAvailable(date);
          return (
            <button
              key={date.toISO() || idx}
              onClick={() => onDateSelect(date)}
              className={`py-3 aspect-square flex items-center justify-center rounded-lg font-medium transition
                ${
                  isSelected
                    ? COLORS.WARM_PURPLE.bg + ' text-white shadow-lg'
                    : isToday
                      ? 'border ' + COLORS.WARM_PURPLE.border + ' ' + COLORS.WARM_PURPLE.DEFAULT
                      : 'text-gray-800 hover:bg-gray-50'
                }
                ${available ? 'relative' : 'opacity-40 cursor-not-allowed'}
                hover:' + COLORS.WARM_PURPLE.hover + ' focus:outline-none focus:' + COLORS.WARM_PURPLE.focus
              `}
              disabled={!available}
              aria-label={date.toLocaleString(DateTime.DATE_FULL)}
            >
              {date.day}
              {available && (
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${COLORS.WARM_PURPLE.bg}`}
                ></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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

// Simple modal for mobile
function TimeSelectionModal({
  open,
  onClose,
  slots,
  date,
  timezone,
  onSlotSelect,
  selectedSlot,
}: {
  open: boolean;
  onClose: () => void;
  slots: TimeSlot[];
  date: DateTime;
  timezone: string;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot: TimeSlot | null | undefined;
}) {
  if (!open) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
      <div className='bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative flex flex-col'>
        <button
          className='absolute top-3 left-3 text-gray-400 hover:text-gray-600'
          onClick={onClose}
          aria-label='Back'
        >
          <ChevronLeft className='h-6 w-6' />
        </button>
        <div className='text-center mb-4'>
          <div className='text-xs text-gray-500'>{date.toFormat('cccc, LLLL d, yyyy')}</div>
          <div className='text-sm text-gray-700 mb-2'>Timezone: {timezone}</div>
        </div>
        <div className='flex flex-col gap-3'>
          {slots.length === 0 ? (
            <div className='text-gray-400 text-center'>No available slots for this date</div>
          ) : (
            slots.map((slot: TimeSlot, idx: number) => {
              const start = DateTime.fromISO(slot.start, { zone: timezone });
              const end = DateTime.fromISO(slot.end, { zone: timezone });
              const isSelected =
                selectedSlot && selectedSlot.start === slot.start && selectedSlot.end === slot.end;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSlotSelect(slot);
                    onClose();
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-150 font-semibold shadow-sm focus:outline-none
                    ${
                      isSelected
                        ? COLORS.WARM_PURPLE.bg + ' text-white border-transparent'
                        : 'bg-white border-gray-200 text-gray-900 hover:' +
                          COLORS.WARM_PURPLE.hover +
                          ' hover:border-' +
                          COLORS.WARM_PURPLE.DEFAULT
                    }
                  `}
                >
                  <Clock className={isSelected ? 'text-white' : COLORS.WARM_PURPLE.DEFAULT} />
                  <span className='flex flex-col items-start'>
                    <span
                      className={isSelected ? 'font-bold text-white' : 'font-bold text-gray-900'}
                    >
                      {start.toFormat('h:mm')} - {end.toFormat('h:mm')}
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-purple-100' : 'text-gray-500'}`}>
                      {start.toFormat('a')} - {end.toFormat('a')}
                    </span>
                  </span>
                  {isSelected && <span className='ml-2 text-white font-bold'>✓</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * TherapistAvailability Component
 *
 * Responsive calendar that shows available days with slots and allows selecting time slots.
 * - On desktop: Calendar on the left, times on the right (only after selection)
 * - On mobile: Full-screen calendar, modal for time selection
 */
export function TherapistAvailability({
  therapistId,
  onSlotSelect,
  onGoogleCalendarNotAvailable,
  selectedSlot,
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
      set.add(DateTime.fromISO(slot.start, { zone: timezoneSignal.value }).toISODate()!);
    });
    return set;
  }, [allAvailableSlots, timezoneSignal.value]);

  // For the selected date, filter out past times only if it's today
  const now = DateTime.now().setZone(timezoneSignal.value);
  const slotsForSelectedDate = useMemo(() => {
    if (!calendarSelectedDate) return [];

    return allAvailableSlots.filter((slot: TimeSlot) => {
      const slotDate = DateTime.fromISO(slot.start, { zone: timezoneSignal.value });

      // Only include slots for the selected date
      if (slotDate.toISODate() !== calendarSelectedDate.toISODate()) return false;

      // If today is selected, only show future slots
      if (calendarSelectedDate.hasSame(now, 'day')) {
        return slotDate > now;
      }

      return true;
    });
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
                    {calendarSelectedDate.toFormat('cccc, LLLL d, yyyy')}
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
                      const start = DateTime.fromISO(slot.start, { zone: timezoneSignal.value });
                      const isSelected =
                        selectedSlot &&
                        selectedSlot.start === slot.start &&
                        selectedSlot.end === slot.end;
                      return (
                        <button
                          key={idx}
                          onClick={() => onSlotSelect(slot)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all duration-150 font-semibold shadow-sm focus:outline-none min-w-[56px] max-w-[80px] justify-center
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
                          <span className='font-bold'>{start.toFormat('h a')}</span>
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
            if (availableDates.has(date.toISODate()!)) {
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
        selectedSlot={selectedSlot}
      />
    </div>
  );
}
