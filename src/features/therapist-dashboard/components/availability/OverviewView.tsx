import { Calendar, Clock, Users } from 'lucide-react';
import { DateTime } from 'luxon';

import type { TimeSlot, WorkingHours, BlockedTime } from '../AvailabilityManagement';

interface OverviewViewProps {
  availabilityStats: {
    thisWeek: number;
    nextWeek: number;
    total: number;
  };
  selectedDate: DateTime;
  setSelectedDate: (date: DateTime) => void;
  currentMonth: DateTime;
  setCurrentMonth: (month: DateTime) => void;
  availableDates: Set<string>;
  slotsForSelectedDate: TimeSlot[];
  _workingHours: WorkingHours[];
  _blockedTimes: BlockedTime[];
}

export function OverviewView({
  availabilityStats,
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  availableDates,
  slotsForSelectedDate,
  _workingHours,
  _blockedTimes,
}: OverviewViewProps) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const renderCalendarDay = (day: DateTime) => {
    const isToday = day.hasSame(DateTime.now(), 'day');
    const isSelected = day.hasSame(selectedDate, 'day');
    const hasAvailability = availableDates.has(day.toISODate()!);
    const isCurrentMonth = day.hasSame(currentMonth, 'month');

    return (
      <button
        key={day.toISODate()}
        onClick={() => setSelectedDate(day)}
        className={`
          w-10 h-10 rounded-lg text-sm font-medium transition-colors
          ${
            isSelected
              ? 'bg-purple-600 text-white'
              : isToday
                ? 'bg-purple-100 text-purple-700'
                : hasAvailability && isCurrentMonth
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : isCurrentMonth
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300'
          }
          ${!isCurrentMonth ? 'cursor-default' : 'cursor-pointer'}
        `}
        disabled={!isCurrentMonth}
      >
        {day.day}
      </button>
    );
  };

  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startOfCalendar = startOfMonth.startOf('week');
    const endOfCalendar = endOfMonth.endOf('week');

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
              <p className='text-2xl font-bold text-green-700'>{availabilityStats.thisWeek}</p>
              <p className='text-green-600 text-sm'>Available slots</p>
            </div>
            <Calendar className='w-8 h-8 text-green-600' />
          </div>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-xl p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-600 text-sm font-medium'>Next Week</p>
              <p className='text-2xl font-bold text-blue-700'>{availabilityStats.nextWeek}</p>
              <p className='text-blue-600 text-sm'>Available slots</p>
            </div>
            <Clock className='w-8 h-8 text-blue-600' />
          </div>
        </div>

        <div className='bg-purple-50 border border-purple-200 rounded-xl p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-purple-600 text-sm font-medium'>Total</p>
              <p className='text-2xl font-bold text-purple-700'>{availabilityStats.total}</p>
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
              {currentMonth.toFormat('MMMM yyyy')}
            </h3>
            <div className='flex gap-2'>
              <button
                onClick={() => setCurrentMonth(currentMonth.minus({ months: 1 }))}
                className='p-2 rounded-lg hover:bg-gray-200 transition-colors'
              >
                ←
              </button>
              <button
                onClick={() => setCurrentMonth(currentMonth.plus({ months: 1 }))}
                className='p-2 rounded-lg hover:bg-gray-200 transition-colors'
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className='grid grid-cols-7 gap-1 mb-4'>
            {dayNames.map((day) => (
              <div key={day} className='text-center text-sm font-medium text-gray-500 py-2'>
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-7 gap-1'>
            {generateCalendarDays().map(renderCalendarDay)}
          </div>

          {/* Legend */}
          <div className='flex items-center justify-center gap-4 mt-4 text-xs'>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-green-200 rounded'></div>
              <span>Available</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-purple-200 rounded'></div>
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className='bg-gray-50 rounded-xl p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            {selectedDate.toFormat('EEEE, MMMM d')}
          </h3>

          {slotsForSelectedDate.length > 0 ? (
            <div className='space-y-2'>
              <h4 className='text-sm font-medium text-gray-600 mb-2'>Available Times</h4>
              <div className='grid grid-cols-2 gap-2'>
                {slotsForSelectedDate.map((slot, index) => (
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
