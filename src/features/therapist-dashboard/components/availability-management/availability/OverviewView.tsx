import { Calendar, Clock, Users } from 'lucide-react';
import { DateTime } from 'luxon';

import {
  availabilityStatsSignal,
  selectedDateSignal,
  currentMonthSignal,
  availableDatesSignal,
  slotsForSelectedDateSignal,
} from '../../state/availabilityState';

export function OverviewView() {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const renderCalendarDay = (day: DateTime) => {
    const isToday = day.hasSame(DateTime.now(), 'day');
    const isSelected = day.hasSame(selectedDateSignal.value, 'day');
    const hasAvailability = availableDatesSignal.value.has(day.toISODate()!);
    const isCurrentMonth = day.hasSame(currentMonthSignal.value, 'month');
    const isPastDate = day < DateTime.now().startOf('day');

    return (
      <button
        key={day.toISODate()}
        onClick={() => (selectedDateSignal.value = day)}
        className={`
          w-10 h-10 rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center relative
          ${
            isSelected
              ? 'bg-purple-600 text-white'
              : isToday
                ? 'bg-purple-100 text-purple-700'
                : isCurrentMonth
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-300'
          }
          ${!isCurrentMonth ? 'cursor-default' : 'cursor-pointer'}
        `}
        disabled={!isCurrentMonth}
      >
        <span className='mb-1'>{day.day}</span>
        {hasAvailability && isCurrentMonth && !isPastDate && (
          <div className='w-1 h-1 bg-green-500 rounded-full absolute bottom-1'></div>
        )}
      </button>
    );
  };

  const generateCalendarDays = () => {
    const startOfMonth = currentMonthSignal.value.startOf('month');

    // Get the weekday of the first day of the month (1 = Monday, 7 = Sunday)
    const firstDayWeekday = startOfMonth.weekday;

    // Calculate how many days to go back to reach Sunday
    // For Luxon: Monday=1, Tuesday=2, ..., Sunday=7
    // We want Sunday=0, Monday=1, ..., Saturday=6 for our calendar
    const daysToSubtract = firstDayWeekday === 7 ? 0 : firstDayWeekday;

    // Get the Sunday before (or on) the first day of the month
    const startOfCalendar = startOfMonth.minus({ days: daysToSubtract });

    // Calculate the end of the calendar (6 weeks = 42 days total)
    const endOfCalendar = startOfCalendar.plus({ days: 41 });

    const days = [];
    let current = startOfCalendar;

    while (current <= endOfCalendar) {
      days.push(current);
      current = current.plus({ days: 1 });
    }

    return days;
  };

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-green-50 border border-green-200 rounded-xl p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-green-600 text-sm font-medium'>This Week</p>
              <p className='text-2xl font-bold text-green-700'>
                {availabilityStatsSignal.value.thisWeek}
              </p>
              <p className='text-green-600 text-sm'>Available slots</p>
            </div>
            <Calendar className='w-8 h-8 text-green-600' />
          </div>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-xl p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-600 text-sm font-medium'>Next Week</p>
              <p className='text-2xl font-bold text-blue-700'>
                {availabilityStatsSignal.value.nextWeek}
              </p>
              <p className='text-blue-600 text-sm'>Available slots</p>
            </div>
            <Clock className='w-8 h-8 text-blue-600' />
          </div>
        </div>

        <div className='bg-purple-50 border border-purple-200 rounded-xl p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-purple-600 text-sm font-medium'>Total</p>
              <p className='text-2xl font-bold text-purple-700'>
                {availabilityStatsSignal.value.total}
              </p>
              <p className='text-purple-600 text-sm'>Available slots</p>
            </div>
            <Users className='w-8 h-8 text-purple-600' />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Calendar */}
        <div className='bg-gray-50 rounded-xl p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-gray-800'>
              {currentMonthSignal.value.toFormat('MMMM yyyy')}
            </h3>
            <div className='flex gap-2'>
              <button
                onClick={() =>
                  (currentMonthSignal.value = currentMonthSignal.value.minus({ months: 1 }))
                }
                className='p-2 rounded-lg hover:bg-gray-200 transition-colors'
              >
                ←
              </button>
              <button
                onClick={() =>
                  (currentMonthSignal.value = currentMonthSignal.value.plus({ months: 1 }))
                }
                className='p-2 rounded-lg hover:bg-gray-200 transition-colors'
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className='grid grid-cols-7 gap-1 mb-4'>
            {dayNames.map((day) => (
              <div
                key={day}
                className='w-10 h-8 flex items-center justify-center text-sm font-medium text-gray-500'
              >
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-7 gap-1'>
            {generateCalendarDays().map(renderCalendarDay)}
          </div>

          {/* Legend */}
          <div className='flex items-center justify-center gap-4 mt-4 text-xs'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <span>Available</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className='bg-gray-50 rounded-xl p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            {selectedDateSignal.value.toFormat('EEEE, MMMM d')}
          </h3>

          {slotsForSelectedDateSignal.value.length > 0 ? (
            <div className='space-y-2'>
              <h4 className='text-sm font-medium text-gray-600 mb-2'>Available Times</h4>
              <div className='grid grid-cols-2 gap-2'>
                {slotsForSelectedDateSignal.value.map((slot, index) => (
                  <div
                    key={index}
                    className='bg-white border border-gray-200 rounded-lg p-3 text-center'
                  >
                    <div className='text-sm font-medium text-gray-900'>
                      {DateTime.fromISO(slot.start).toFormat('h:mm a')}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {DateTime.fromISO(slot.end).toFormat('h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='text-center py-8'>
              <Calendar className='w-12 h-12 text-gray-300 mx-auto mb-2' />
              <p className='text-gray-500'>No availability for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
