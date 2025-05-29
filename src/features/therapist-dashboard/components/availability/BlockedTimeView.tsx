import { Plus, X, Calendar, Clock, Trash2 } from 'lucide-react';
import { DateTime } from 'luxon';

import type { BlockedTime } from '../AvailabilityManagement';

interface BlockedTimeViewProps {
  blockedTimes: BlockedTime[];
  showAddBlockedTime: boolean;
  setShowAddBlockedTime: (show: boolean) => void;
  newBlockedTime: Partial<BlockedTime>;
  setNewBlockedTime: (blockedTime: Partial<BlockedTime>) => void;
  savingBlockedTime: boolean;
  saveBlockedTime: () => void;
  removeBlockedTime: (id: number) => void;
  selectedDate: DateTime;
  setNewBlockedTimeDate: (date: string) => void;
}

export function BlockedTimeView({
  blockedTimes,
  showAddBlockedTime,
  setShowAddBlockedTime,
  newBlockedTime,
  setNewBlockedTime,
  savingBlockedTime,
  saveBlockedTime,
  removeBlockedTime,
  selectedDate,
  setNewBlockedTimeDate,
}: BlockedTimeViewProps) {
  const formatDate = (dateString: string) => {
    return DateTime.fromISO(dateString).toFormat('EEE, MMM d, yyyy');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleQuickAddForSelectedDate = () => {
    setNewBlockedTimeDate(selectedDate.toISODate()!);
    setShowAddBlockedTime(true);
  };

  const sortedBlockedTimes = [...blockedTimes].sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.startTime);
    const dateB = new Date(b.date + 'T' + b.startTime);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800'>Blocked Time</h3>
          <p className='text-gray-600 text-sm'>
            Block specific times when you're not available for sessions.
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={handleQuickAddForSelectedDate}
            className='flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors'
          >
            <Calendar className='w-4 h-4' />
            Block {selectedDate.toFormat('MMM d')}
          </button>
          <button
            onClick={() => setShowAddBlockedTime(true)}
            className='flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
          >
            <Plus className='w-4 h-4' />
            Add Blocked Time
          </button>
        </div>
      </div>

      {/* Add Blocked Time Form */}
      {showAddBlockedTime && (
        <div className='bg-red-50 border border-red-200 rounded-xl p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-lg font-semibold text-red-800'>Add Blocked Time</h4>
            <button
              onClick={() => {
                setShowAddBlockedTime(false);
                setNewBlockedTime({});
              }}
              className='p-1 text-red-600 hover:bg-red-100 rounded transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Date</label>
              <input
                type='date'
                value={newBlockedTime.date || ''}
                onChange={(e) => setNewBlockedTime({ ...newBlockedTime, date: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Start Time</label>
              <input
                type='time'
                value={newBlockedTime.startTime || ''}
                onChange={(e) =>
                  setNewBlockedTime({ ...newBlockedTime, startTime: e.target.value })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>End Time</label>
              <input
                type='time'
                value={newBlockedTime.endTime || ''}
                onChange={(e) => setNewBlockedTime({ ...newBlockedTime, endTime: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
              />
            </div>

            <div className='flex items-end'>
              <label className='flex items-center gap-2 text-sm text-gray-700'>
                <input
                  type='checkbox'
                  checked={newBlockedTime.isRecurring || false}
                  onChange={(e) =>
                    setNewBlockedTime({ ...newBlockedTime, isRecurring: e.target.checked })
                  }
                  className='rounded border-gray-300 text-red-600 focus:ring-red-500'
                />
                Recurring weekly
              </label>
            </div>
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Reason (optional)
            </label>
            <input
              type='text'
              value={newBlockedTime.reason || ''}
              onChange={(e) => setNewBlockedTime({ ...newBlockedTime, reason: e.target.value })}
              placeholder='e.g., Personal appointment, Vacation, etc.'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
            />
          </div>

          <div className='flex justify-end gap-2'>
            <button
              onClick={() => {
                setShowAddBlockedTime(false);
                setNewBlockedTime({});
              }}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={saveBlockedTime}
              disabled={savingBlockedTime}
              className='flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
            >
              {savingBlockedTime ? (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <Plus className='w-4 h-4' />
              )}
              Add Blocked Time
            </button>
          </div>
        </div>
      )}

      {/* Blocked Times List */}
      {sortedBlockedTimes.length === 0 ? (
        <div className='text-center py-12'>
          <Clock className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h4 className='text-lg font-medium text-gray-500 mb-2'>No Blocked Times</h4>
          <p className='text-gray-400 mb-4'>
            You haven't blocked any time slots yet. Add blocked times for when you're unavailable.
          </p>
          <button
            onClick={() => setShowAddBlockedTime(true)}
            className='bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors'
          >
            Add Your First Blocked Time
          </button>
        </div>
      ) : (
        <div className='bg-gray-50 rounded-xl p-6'>
          <div className='grid gap-4'>
            {sortedBlockedTimes.map((blockedTime) => (
              <div key={blockedTime.id} className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                    <div>
                      <div className='font-medium text-gray-900'>
                        {formatDate(blockedTime.date)}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {formatTime(blockedTime.startTime)} - {formatTime(blockedTime.endTime)}
                        {blockedTime.isRecurring && (
                          <span className='ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full'>
                            Recurring
                          </span>
                        )}
                      </div>
                      {blockedTime.reason && (
                        <div className='text-sm text-gray-500 mt-1'>{blockedTime.reason}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => blockedTime.id && removeBlockedTime(blockedTime.id)}
                    className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                    title='Remove blocked time'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
        <h4 className='font-medium text-yellow-800 mb-2'>About Blocked Time</h4>
        <ul className='text-sm text-yellow-700 space-y-1'>
          <li>• Blocked times prevent clients from booking sessions during those periods</li>
          <li>
            • Use recurring blocks for regular unavailability (e.g., lunch breaks, weekly meetings)
          </li>
          <li>• One-time blocks are perfect for vacations, appointments, or personal time</li>
          <li>• Blocked times override your regular working hours</li>
        </ul>
      </div>
    </div>
  );
}
