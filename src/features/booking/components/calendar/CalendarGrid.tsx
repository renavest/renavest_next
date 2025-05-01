import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateTime, Info } from 'luxon';
import React from 'react';

import { COLORS } from '@/src/styles/colors';

interface CalendarGridProps {
  selectedDate: DateTime;
  onDateSelect: (date: DateTime) => void;
  availableDates: Set<string>; // ISO date strings
  timezone: string;
  currentMonth: DateTime;
  setCurrentMonth: (date: DateTime) => void;
}

export function CalendarGrid({
  selectedDate,
  onDateSelect,
  availableDates,
  timezone,
  currentMonth,
  setCurrentMonth,
}: CalendarGridProps) {
  const today = DateTime.now().setZone(timezone).startOf('day');
  const daysInMonth = currentMonth.daysInMonth || 31;
  const firstDayOfWeek = currentMonth.startOf('month').weekday % 7; // 0=Sunday
  const days: Array<DateTime | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(currentMonth.set({ day: d }));
  }
  // Helper: is available and not before today
  const isAvailable = (date: DateTime) => {
    return availableDates.has(date.toISODate()!) && date.startOf('day') >= today;
  };
  const isPast = (date: DateTime) => date.startOf('day') < today;

  return (
    <div className='w-full p-0 mb-4'>
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
          const past = isPast(date);
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
                ${available && !past ? 'relative' : 'opacity-40 cursor-not-allowed'}
                hover:' + COLORS.WARM_PURPLE.hover + ' focus:outline-none focus:' + COLORS.WARM_PURPLE.focus
              `}
              disabled={!available || past}
              aria-label={date.toLocaleString(DateTime.DATE_FULL)}
            >
              {date.day}
              {available && !past && (
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
