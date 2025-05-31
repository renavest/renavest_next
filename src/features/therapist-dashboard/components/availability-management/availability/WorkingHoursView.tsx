import { Clock, Plus, Trash2, Save } from 'lucide-react';

import {
  workingHoursSignal,
  showAddWorkingHoursSignal,
  newWorkingHoursSignal,
  savingWorkingHoursSignal,
  saveWorkingHours,
  removeWorkingHours,
} from '../../../state/availabilityState';

interface WorkingHoursViewProps {
  therapistId: number;
}

const WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

export function WorkingHoursView({ therapistId }: WorkingHoursViewProps) {
  const handleSave = () => {
    saveWorkingHours(therapistId);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-800'>Working Hours</h3>
        <div className='flex gap-2'>
          {editingWorkingHoursSignal.value ? (
            <>
              <button
                onClick={() => (editingWorkingHoursSignal.value = false)}
                className='px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1'
              >
                <X className='w-4 h-4' />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={savingWorkingHoursSignal.value}
                className='px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1'
              >
                <Check className='w-4 h-4' />
                {savingWorkingHoursSignal.value ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => (editingWorkingHoursSignal.value = true)}
              className='px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors'
            >
              Edit Hours
            </button>
          )}
        </div>
      </div>

      {editingWorkingHoursSignal.value ? (
        <div className='space-y-4'>
          {workingHoursSignal.value.map((hour, index) => (
            <div key={index} className='bg-gray-50 rounded-lg p-4 space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium text-gray-800'>Working Hour {index + 1}</h4>
                <button
                  onClick={() => removeWorkingHour(index)}
                  className='text-red-600 hover:bg-red-50 p-1 rounded transition-colors'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Day of Week
                  </label>
                  <select
                    value={hour.dayOfWeek}
                    onChange={(e) =>
                      updateWorkingHour(index, 'dayOfWeek', parseInt(e.target.value))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                  >
                    {WEEKDAYS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Start Time</label>
                  <input
                    type='time'
                    value={hour.startTime}
                    onChange={(e) => updateWorkingHour(index, 'startTime', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>End Time</label>
                  <input
                    type='time'
                    value={hour.endTime}
                    onChange={(e) => updateWorkingHour(index, 'endTime', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                  />
                </div>
              </div>

              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id={`recurring-${index}`}
                  checked={hour.isRecurring}
                  onChange={(e) => updateWorkingHour(index, 'isRecurring', e.target.checked)}
                  className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
                />
                <label htmlFor={`recurring-${index}`} className='ml-2 text-sm text-gray-700'>
                  Recurring (applies every week)
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={addWorkingHour}
            className='w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-2'
          >
            <Plus className='w-5 h-5' />
            Add Working Hours
          </button>
        </div>
      ) : (
        <div className='space-y-3'>
          {workingHoursSignal.value.length > 0 ? (
            workingHoursSignal.value.map((hour, index) => {
              const weekday = WEEKDAYS.find((day) => day.value === hour.dayOfWeek);
              return (
                <div
                  key={index}
                  className='bg-gray-50 rounded-lg p-4 flex justify-between items-center'
                >
                  <div>
                    <p className='font-medium text-gray-800'>{weekday?.label}</p>
                    <p className='text-sm text-gray-600'>
                      {hour.startTime} - {hour.endTime}
                      {hour.isRecurring && ' (Weekly)'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <p>No working hours configured</p>
              <p className='text-sm'>Click "Edit Hours" to set your availability</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
