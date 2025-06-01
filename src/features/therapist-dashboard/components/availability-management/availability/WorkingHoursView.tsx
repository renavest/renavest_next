import { Clock, Plus, Trash2, Save, Check, X, Globe } from 'lucide-react';

import {
  workingHoursSignal,
  editingWorkingHoursSignal,
  savingWorkingHoursSignal,
  therapistTimezoneSignal,
  addWorkingHour,
  updateWorkingHour,
  removeWorkingHour,
  saveWorkingHours,
} from '../../../state/availabilityState';
import type { WorkingHours } from '../../../types/availability';

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
        <div className='flex items-center gap-3'>
          <h3 className='text-lg font-semibold text-gray-800'>Working Hours</h3>
          {therapistTimezoneSignal.value && (
            <div className='flex items-center gap-1 text-xs text-gray-500 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full'>
              <Globe className='w-3 h-3' />
              <span>{therapistTimezoneSignal.value}</span>
            </div>
          )}
        </div>
        <div className='flex gap-2'>
          {editingWorkingHoursSignal.value ? (
            <>
              <button
                onClick={() => (editingWorkingHoursSignal.value = false)}
                className='px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-200'
              >
                <X className='w-4 h-4' />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={savingWorkingHoursSignal.value}
                className='px-6 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105'
              >
                <Check className='w-4 h-4' />
                {savingWorkingHoursSignal.value ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => (editingWorkingHoursSignal.value = true)}
              className='px-6 py-3 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5'
            >
              <Clock className='w-5 h-5' />✨ Edit Hours
            </button>
          )}
        </div>
      </div>

      {editingWorkingHoursSignal.value ? (
        <div className='space-y-4'>
          {workingHoursSignal.value.map((hour, index) => (
            <div
              key={index}
              className='bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 space-y-4 border border-gray-200 shadow-sm'
            >
              <div className='flex items-center justify-between'>
                <h4 className='font-medium text-gray-800 flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-purple-600' />
                  Working Hour {index + 1}
                </h4>
                <button
                  onClick={() => removeWorkingHour(index)}
                  className='text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 hover:scale-110'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Day of Week
                  </label>
                  <select
                    value={hour.dayOfWeek}
                    onChange={(e) =>
                      updateWorkingHour(index, 'dayOfWeek', parseInt(e.target.value))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200'
                  >
                    {WEEKDAYS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Start Time</label>
                  <input
                    type='time'
                    value={hour.startTime}
                    onChange={(e) => updateWorkingHour(index, 'startTime', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>End Time</label>
                  <input
                    type='time'
                    value={hour.endTime}
                    onChange={(e) => updateWorkingHour(index, 'endTime', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200'
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
                  🔄 Recurring (applies every week)
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={addWorkingHour}
            className='w-full border-2 border-dashed border-purple-300 rounded-xl p-6 text-purple-600 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-3 font-medium hover:scale-102 transform'
          >
            <Plus className='w-5 h-5' />➕ Add Working Hours
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
                  className='bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 flex justify-between items-center border border-gray-200 shadow-sm'
                >
                  <div>
                    <p className='font-medium text-gray-800 flex items-center gap-2'>
                      <Clock className='w-4 h-4 text-purple-600' />
                      {weekday?.label}
                    </p>
                    <p className='text-sm text-gray-600 ml-6'>
                      {hour.startTime} - {hour.endTime}
                      {hour.isRecurring && ' 🔄 (Weekly)'}
                      {therapistTimezoneSignal.value && (
                        <span className='ml-2 text-xs text-blue-600'>
                          {therapistTimezoneSignal.value}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='text-center py-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-dashed border-purple-200'>
              <Clock className='w-16 h-16 text-purple-300 mx-auto mb-4' />
              <p className='text-gray-600 font-medium mb-2'>No working hours configured</p>
              <p className='text-sm text-gray-500'>
                Click "✨ Edit Hours" to set your availability and start accepting clients!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
