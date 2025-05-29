import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { DateTime } from 'luxon';

import {
  blockedTimesSignal,
  showAddBlockedTimeSignal,
  newBlockedTimeSignal,
  savingBlockedTimeSignal,
  selectedDateSignal,
  saveBlockedTime,
  removeBlockedTime,
} from '../../state/availabilityState';

interface BlockedTimeViewProps {
  therapistId: number;
}

export function BlockedTimeView({ therapistId }: BlockedTimeViewProps) {
  const handleSave = () => {
    saveBlockedTime(therapistId);
  };

  const handleRemove = (id: number) => {
    removeBlockedTime(therapistId, id);
  };

  const handleAddNewClick = () => {
    // Pre-populate with selected date if available
    const selectedDateStr = selectedDateSignal.value.toISODate();
    newBlockedTimeSignal.value = {
      date: selectedDateStr || '',
      startTime: '09:00',
      endTime: '10:00',
      reason: '',
      isRecurring: false,
    };
    showAddBlockedTimeSignal.value = true;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800'>Blocked Times</h3>
          <p className='text-gray-600 text-sm'>
            Block specific times when you're not available for sessions
          </p>
        </div>
        <button
          onClick={handleAddNewClick}
          className='flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
        >
          <Plus className='w-4 h-4' />
          Add Blocked Time
        </button>
      </div>

      {/* Add Blocked Time Form */}
      {showAddBlockedTimeSignal.value && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-6'>
          <h4 className='font-medium text-gray-800 mb-4'>Block New Time</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Date</label>
              <input
                type='date'
                value={newBlockedTimeSignal.value.date || ''}
                onChange={(e) =>
                  (newBlockedTimeSignal.value = {
                    ...newBlockedTimeSignal.value,
                    date: e.target.value,
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Start Time</label>
              <input
                type='time'
                value={newBlockedTimeSignal.value.startTime || ''}
                onChange={(e) =>
                  (newBlockedTimeSignal.value = {
                    ...newBlockedTimeSignal.value,
                    startTime: e.target.value,
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>End Time</label>
              <input
                type='time'
                value={newBlockedTimeSignal.value.endTime || ''}
                onChange={(e) =>
                  (newBlockedTimeSignal.value = {
                    ...newBlockedTimeSignal.value,
                    endTime: e.target.value,
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Reason (Optional)
              </label>
              <input
                type='text'
                placeholder='e.g., Appointment, Travel'
                value={newBlockedTimeSignal.value.reason || ''}
                onChange={(e) =>
                  (newBlockedTimeSignal.value = {
                    ...newBlockedTimeSignal.value,
                    reason: e.target.value,
                  })
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            </div>
          </div>

          <div className='flex items-center mt-4'>
            <input
              type='checkbox'
              id='recurring'
              checked={newBlockedTimeSignal.value.isRecurring || false}
              onChange={(e) =>
                (newBlockedTimeSignal.value = {
                  ...newBlockedTimeSignal.value,
                  isRecurring: e.target.checked,
                })
              }
              className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
            />
            <label htmlFor='recurring' className='ml-2 text-sm text-gray-700'>
              Recurring (blocks this time every week)
            </label>
          </div>

          <div className='flex gap-2 mt-6'>
            <button
              onClick={() => (showAddBlockedTimeSignal.value = false)}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={savingBlockedTimeSignal.value}
              className='flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors'
            >
              {savingBlockedTimeSignal.value ? (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <Plus className='w-4 h-4' />
              )}
              {savingBlockedTimeSignal.value ? 'Saving...' : 'Block Time'}
            </button>
          </div>
        </div>
      )}

      {/* Blocked Times List */}
      {blockedTimesSignal.value.length > 0 ? (
        <div className='space-y-3'>
          {blockedTimesSignal.value.map((blocked) => (
            <div
              key={blocked.id}
              className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between'
            >
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2 text-red-600'>
                  <Calendar className='w-4 h-4' />
                  <span className='font-medium'>
                    {DateTime.fromISO(blocked.date).toFormat('EEEE, MMM d')}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-red-600'>
                  <Clock className='w-4 h-4' />
                  <span>
                    {blocked.startTime} - {blocked.endTime}
                  </span>
                </div>
                {blocked.reason && <span className='text-red-600 text-sm'>({blocked.reason})</span>}
                {blocked.isRecurring && (
                  <span className='bg-red-100 text-red-700 px-2 py-1 rounded text-xs'>
                    Recurring
                  </span>
                )}
              </div>
              <button
                onClick={() => blocked.id && handleRemove(blocked.id)}
                className='text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors'
                title='Remove blocked time'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <Calendar className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h4 className='text-lg font-medium text-gray-500 mb-2'>No Blocked Times</h4>
          <p className='text-gray-400 mb-4'>
            You haven't blocked any times yet. Block specific times when you're not available.
          </p>
          <button
            onClick={handleAddNewClick}
            className='bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors'
          >
            Add First Blocked Time
          </button>
        </div>
      )}
    </div>
  );
}
