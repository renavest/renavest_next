import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateTime, Info } from 'luxon';
import React from 'react';

import { COLORS } from '@/src/styles/colors';

import type { CalendarGridProps } from '../../types';

export function CalendarGrid({
  selectedDate,
  onDateSelect,
  availableDates,
  minDate,
  maxDate,
  currentMonth: currentMonthProp,
  onMonthChange,
}: CalendarGridProps) {
  const currentMonth = DateTime.fromJSDate(currentMonthProp);

  const today = DateTime.now().startOf('day');
  const daysInMonth = currentMonth.daysInMonth || 31;
  const firstDayOfWeek = currentMonth.startOf('month').weekday % 7; // 0=Sunday
  const days: Array<DateTime | null> = [];

  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(currentMonth.set({ day: d }));
  }

  // Helper: is available and within date range
  const isAvailable = (date: DateTime) => {
    const jsDate = date.toJSDate();
    const isInAvailableDates = availableDates.some((availableDate) =>
      DateTime.fromJSDate(availableDate).hasSame(date, 'day'),
    );
    const afterMinDate = !minDate || jsDate >= minDate;
    const beforeMaxDate = !maxDate || jsDate <= maxDate;

    return isInAvailableDates && afterMinDate && beforeMaxDate && date.startOf('day') >= today;
  };

  const isPast = (date: DateTime) => date.startOf('day') < today;

  const handleDateSelect = (date: DateTime) => {
    if (isAvailable(date)) {
      onDateSelect(date.toJSDate());
    }
  };

  const handlePreviousMonth = () => {
    const newMonth = currentMonth.minus({ months: 1 });
    onMonthChange?.(newMonth.toJSDate());
  };

  const handleNextMonth = () => {
    const newMonth = currentMonth.plus({ months: 1 });
    onMonthChange?.(newMonth.toJSDate());
  };

  return (
    <div className='w-full p-0 mb-4'>
      <div className='flex items-center justify-between mb-6'>
        <button
          className='p-2 rounded-full hover:bg-gray-100 transition'
          onClick={handlePreviousMonth}
          aria-label='Previous month'
        >
          <ChevronLeft className='w-5 h-5 text-gray-500' />
        </button>
        <div className='font-semibold text-xl text-gray-800'>
          {currentMonth.toFormat('MMMM yyyy')}
        </div>
        <button
          className='p-2 rounded-full hover:bg-gray-100 transition'
          onClick={handleNextMonth}
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
          const isSelected = selectedDate && DateTime.fromJSDate(selectedDate).hasSame(date, 'day');
          const available = isAvailable(date);
          const past = isPast(date);

          return (
            <button
              key={date.toISO() || idx}
              onClick={() => handleDateSelect(date)}
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
