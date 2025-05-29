import { Calendar, Clock, Settings } from 'lucide-react';
import { DateTime } from 'luxon';

import { CalendarGrid } from '@/src/features/booking/components/calendar/CalendarGrid';
import { createDate } from '@/src/utils/timezone';

import type { TimeSlot, WorkingHours, BlockedTime } from '../AvailabilityManagement';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 0, label: 'Sunday', short: 'Sun' },
];

interface OverviewViewProps {
  availabilityStats: { thisWeek: number; nextWeek: number; total: number };
  selectedDate: DateTime;
  setSelectedDate: (date: DateTime) => void;
  currentMonth: DateTime;
  setCurrentMonth: (month: DateTime) => void;
  availableDates: Set<string>;
  slotsForSelectedDate: TimeSlot[];
  workingHours: WorkingHours[];
  blockedTimes: BlockedTime[];
}

export function OverviewView({
  availabilityStats,
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  availableDates,
  slotsForSelectedDate,
  workingHours,
  blockedTimes,
}: OverviewViewProps) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className='space-y-6'>
      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-blue-600'>This Week</p>
              <p className='text-2xl font-bold text-blue-700'>{availabilityStats.thisWeek}</p>
            </div>
            <Calendar className='h-8 w-8 text-blue-500' />
          </div>
        </div>
        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-green-600'>Next Week</p>
              <p className='text-2xl font-bold text-green-700'>{availabilityStats.nextWeek}</p>
            </div>
            <Clock className='h-8 w-8 text-green-500' />
          </div>
        </div>
        <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-purple-600'>Total Slots</p>
              <p className='text-2xl font-bold text-purple-700'>{availabilityStats.total}</p>
            </div>
            <Settings className='h-8 w-8 text-purple-500' />
          </div>
        </div>
      </div>

      {/* Calendar and Time Slots */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>Calendar Overview</h3>
          <CalendarGrid
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            availableDates={availableDates}
            timezone={timezone}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
        </div>

        <div>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            {selectedDate.toFormat('EEEE, MMMM d')}
          </h3>
          {slotsForSelectedDate.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <Clock className='h-12 w-12 mx-auto mb-2 text-gray-300' />
              <p>No available slots for this date</p>
            </div>
          ) : (
            <div className='space-y-2 max-h-60 overflow-y-auto'>
              {slotsForSelectedDate.map((slot, idx) => {
                const start = createDate(slot.start, timezone);
                const end = createDate(slot.end, timezone);
                return (
                  <div
                    key={idx}
                    className='flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200'
                  >
                    <span className='font-medium text-green-700'>
                      {start.toFormat('h:mm a')} - {end.toFormat('h:mm a')}
                    </span>
                    <span className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                      Available
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200'>
        <div>
          <h4 className='font-semibold text-gray-800 mb-2'>Working Hours</h4>
          {workingHours.length === 0 ? (
            <p className='text-gray-500 text-sm'>No working hours set</p>
          ) : (
            <div className='space-y-1'>
              {workingHours.map((hours, idx) => (
                <div key={idx} className='text-sm text-gray-600'>
                  {DAYS_OF_WEEK.find((d) => d.value === hours.dayOfWeek)?.label}: {hours.startTime}{' '}
                  - {hours.endTime}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className='font-semibold text-gray-800 mb-2'>Blocked Times</h4>
          {blockedTimes.length === 0 ? (
            <p className='text-gray-500 text-sm'>No blocked times</p>
          ) : (
            <div className='space-y-1 max-h-32 overflow-y-auto'>
              {blockedTimes.slice(0, 3).map((blocked, idx) => (
                <div key={idx} className='text-sm text-gray-600'>
                  {blocked.date}: {blocked.startTime} - {blocked.endTime}
                  {blocked.reason && <span className='text-gray-400'> ({blocked.reason})</span>}
                </div>
              ))}
              {blockedTimes.length > 3 && (
                <p className='text-xs text-gray-400'>...and {blockedTimes.length - 3} more</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
