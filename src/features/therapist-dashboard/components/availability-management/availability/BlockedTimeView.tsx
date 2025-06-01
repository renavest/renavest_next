import { Trash2, Calendar, Clock, Globe, Ban } from 'lucide-react';
import { DateTime } from 'luxon';

import {
  blockedTimesSignal,
  showAddBlockedTimeSignal,
  newBlockedTimeSignal,
  savingBlockedTimeSignal,
  selectedDateSignal,
  therapistTimezoneSignal,
  saveBlockedTime,
  removeBlockedTime,
} from '../../../state/availabilityState';

interface BlockedTimeViewProps {
  therapistId: number;
}

// Extracted form component to reduce line count
function AddBlockedTimeForm({ therapistId }: { therapistId: number }) {
  const handleSave = () => {
    saveBlockedTime(therapistId);
  };

  return (
    <div className='bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 shadow-sm'>
      <h4 className='font-medium text-gray-800 mb-6 flex items-center gap-2'>
        <Ban className='w-5 h-5 text-red-500' />
        Block New Time
        {therapistTimezoneSignal.value && (
          <span className='text-xs text-red-600 bg-red-100 px-2 py-1 rounded-md ml-2'>
            {therapistTimezoneSignal.value}
          </span>
        )}
      </h4>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>📅 Date</label>
          <input
            type='date'
            value={newBlockedTimeSignal.value.date || ''}
            onChange={(e) =>
              (newBlockedTimeSignal.value = {
                ...newBlockedTimeSignal.value,
                date: e.target.value,
              })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>⏰ Start Time</label>
          <input
            type='time'
            value={newBlockedTimeSignal.value.startTime || ''}
            onChange={(e) =>
              (newBlockedTimeSignal.value = {
                ...newBlockedTimeSignal.value,
                startTime: e.target.value,
              })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>⏰ End Time</label>
          <input
            type='time'
            value={newBlockedTimeSignal.value.endTime || ''}
            onChange={(e) =>
              (newBlockedTimeSignal.value = {
                ...newBlockedTimeSignal.value,
                endTime: e.target.value,
              })
            }
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            📝 Reason (Optional)
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
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200'
          />
        </div>
      </div>

      <div className='flex items-center mt-6'>
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
          className='h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded'
        />
        <label htmlFor='recurring' className='ml-2 text-sm text-gray-700'>
          🔄 Recurring (blocks this time every week)
        </label>
      </div>

      <div className='flex gap-3 mt-6'>
        <button
          onClick={() => (showAddBlockedTimeSignal.value = false)}
          className='px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200'
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={savingBlockedTimeSignal.value}
          className='flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105'
        >
          {savingBlockedTimeSignal.value ? (
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
          ) : (
            <Ban className='w-4 h-4' />
          )}
          {savingBlockedTimeSignal.value ? 'Saving...' : '🚫 Block Time'}
        </button>
      </div>
    </div>
  );
}

export function BlockedTimeView({ therapistId }: BlockedTimeViewProps) {
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
        <div className='flex items-center gap-3'>
          <div>
            <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <Ban className='w-5 h-5 text-red-500' />
              Blocked Times
            </h3>
            <p className='text-gray-600 text-sm'>
              Block specific times when you're not available for sessions
            </p>
          </div>
          {therapistTimezoneSignal.value && (
            <div className='flex items-center gap-1 text-xs text-gray-500 bg-red-50 border border-red-200 px-3 py-1 rounded-full'>
              <Globe className='w-3 h-3' />
              <span>{therapistTimezoneSignal.value}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleAddNewClick}
          className='px-6 py-3 text-base font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5'
        >
          <Ban className='w-5 h-5' />
          🚫 Block Time
        </button>
      </div>

      {/* Add Blocked Time Form */}
      {showAddBlockedTimeSignal.value && <AddBlockedTimeForm therapistId={therapistId} />}

      {/* Blocked Times List */}
      {blockedTimesSignal.value.length > 0 ? (
        <div className='space-y-3'>
          {blockedTimesSignal.value.map((blocked) => (
            <div
              key={blocked.id}
              className='bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200'
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
                    {therapistTimezoneSignal.value && (
                      <span className='ml-2 text-xs text-red-500'>
                        {therapistTimezoneSignal.value}
                      </span>
                    )}
                  </span>
                </div>
                {blocked.reason && (
                  <span className='text-red-600 text-sm'>📝 ({blocked.reason})</span>
                )}
                {blocked.isRecurring && (
                  <span className='bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium'>
                    🔄 Recurring
                  </span>
                )}
              </div>
              <button
                onClick={() => blocked.id && handleRemove(blocked.id)}
                className='text-red-600 hover:bg-red-100 p-2 rounded-lg transition-all duration-200 hover:scale-110'
                title='Remove blocked time'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-dashed border-red-200'>
          <Ban className='w-16 h-16 text-red-300 mx-auto mb-4' />
          <h4 className='text-lg font-medium text-gray-600 mb-2'>No Blocked Times</h4>
          <p className='text-gray-500 mb-6'>
            You haven't blocked any times yet. Block specific times when you're not available to
            protect your schedule!
          </p>
          <button
            onClick={handleAddNewClick}
            className='bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium'
          >
            🚫 Add First Blocked Time
          </button>
        </div>
      )}
    </div>
  );
}
