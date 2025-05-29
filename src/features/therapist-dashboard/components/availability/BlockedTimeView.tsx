import { Plus, X } from 'lucide-react';
import { DateTime } from 'luxon';

import type { BlockedTime } from '../AvailabilityManagement';

interface BlockedTimeViewProps {
  blockedTimes: BlockedTime[];
  showAddBlockedTime: boolean;
  setShowAddBlockedTime: (show: boolean) => void;
  newBlockedTime: Partial<BlockedTime>;
  setNewBlockedTime: (blocked: Partial<BlockedTime>) => void;
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
  const handleBlockTimeClick = () => {
    setShowAddBlockedTime(true);
    const dateString = selectedDate.toISODate();
    if (dateString) {
      setNewBlockedTimeDate(dateString);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800'>Blocked Time</h3>
          <p className='text-sm text-gray-600'>Block specific times when you're unavailable</p>
        </div>
        <button
          onClick={handleBlockTimeClick}
          className='px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2'
        >
          <Plus className='w-4 h-4' />
          Block Time
        </button>
      </div>

      {showAddBlockedTime && (
        <div className='p-4 border border-gray-200 rounded-lg bg-gray-50'>
          <h4 className='font-medium text-gray-800 mb-3'>Block New Time</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Date</label>
              <input
                type='date'
                value={newBlockedTime.date || ''}
                onChange={(e) => setNewBlockedTime({ ...newBlockedTime, date: e.target.value })}
                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Reason (Optional)
              </label>
              <input
                type='text'
                placeholder='e.g., Personal appointment'
                value={newBlockedTime.reason || ''}
                onChange={(e) => setNewBlockedTime({ ...newBlockedTime, reason: e.target.value })}
                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
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
                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>End Time</label>
              <input
                type='time'
                value={newBlockedTime.endTime || ''}
                onChange={(e) => setNewBlockedTime({ ...newBlockedTime, endTime: e.target.value })}
                className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
              />
            </div>
          </div>
          <div className='flex items-center gap-2 mt-4'>
            <button
              onClick={() => setShowAddBlockedTime(false)}
              className='px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              onClick={saveBlockedTime}
              disabled={savingBlockedTime}
              className='px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50'
            >
              {savingBlockedTime ? 'Saving...' : 'Block Time'}
            </button>
          </div>
        </div>
      )}

      <div className='space-y-3'>
        {blockedTimes.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <X className='h-12 w-12 mx-auto mb-2 text-gray-300' />
            <p>No blocked times</p>
            <p className='text-sm'>Click "Block Time" to add unavailable periods</p>
          </div>
        ) : (
          blockedTimes.map((blocked, index) => (
            <div
              key={blocked.id || index}
              className='flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200'
            >
              <div>
                <div className='flex items-center gap-4'>
                  <span className='font-medium text-red-800'>
                    {DateTime.fromISO(blocked.date).toFormat('EEEE, MMMM d')}
                  </span>
                  <span className='text-red-600'>
                    {blocked.startTime} - {blocked.endTime}
                  </span>
                </div>
                {blocked.reason && <p className='text-sm text-red-600 mt-1'>{blocked.reason}</p>}
              </div>
              <button
                onClick={() => blocked.id && removeBlockedTime(blocked.id)}
                className='p-2 text-red-600 hover:bg-red-100 rounded-md'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
