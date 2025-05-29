import { Clock, Edit3, Plus, X } from 'lucide-react';

import type { WorkingHours } from '../AvailabilityManagement';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 0, label: 'Sunday', short: 'Sun' },
];

interface WorkingHoursViewProps {
  workingHours: WorkingHours[];
  editingWorkingHours: boolean;
  setEditingWorkingHours: (editing: boolean) => void;
  savingWorkingHours: boolean;
  addWorkingHour: () => void;
  updateWorkingHour: (
    index: number,
    field: keyof WorkingHours,
    value: string | number | boolean,
  ) => void;
  removeWorkingHour: (index: number) => void;
  saveWorkingHours: () => void;
}

export function WorkingHoursView({
  workingHours,
  editingWorkingHours,
  setEditingWorkingHours,
  savingWorkingHours,
  addWorkingHour,
  updateWorkingHour,
  removeWorkingHour,
  saveWorkingHours,
}: WorkingHoursViewProps) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800'>Working Hours</h3>
          <p className='text-sm text-gray-600'>Set your availability for client bookings</p>
        </div>
        <div className='flex items-center gap-2'>
          {editingWorkingHours ? (
            <>
              <button
                onClick={() => setEditingWorkingHours(false)}
                className='px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={saveWorkingHours}
                disabled={savingWorkingHours}
                className='px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50'
              >
                {savingWorkingHours ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingWorkingHours(true)}
              className='px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2'
            >
              <Edit3 className='w-4 h-4' />
              Edit Hours
            </button>
          )}
        </div>
      </div>

      {editingWorkingHours ? (
        <div className='space-y-4'>
          {workingHours.map((hours, index) => (
            <div key={index} className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
              <select
                value={hours.dayOfWeek}
                onChange={(e) => updateWorkingHour(index, 'dayOfWeek', parseInt(e.target.value))}
                className='bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>

              <input
                type='time'
                value={hours.startTime}
                onChange={(e) => updateWorkingHour(index, 'startTime', e.target.value)}
                className='bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
              />

              <span className='text-gray-500 text-sm'>to</span>

              <input
                type='time'
                value={hours.endTime}
                onChange={(e) => updateWorkingHour(index, 'endTime', e.target.value)}
                className='bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
              />

              <button
                onClick={() => removeWorkingHour(index)}
                className='p-2 text-red-600 hover:bg-red-50 rounded-md'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          ))}

          <button
            onClick={addWorkingHour}
            className='w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600'
          >
            <Plus className='w-4 h-4' />
            Add Working Hours
          </button>
        </div>
      ) : (
        <div className='space-y-3'>
          {workingHours.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <Clock className='h-12 w-12 mx-auto mb-2 text-gray-300' />
              <p>No working hours set</p>
              <p className='text-sm'>Click "Edit Hours" to add your availability</p>
            </div>
          ) : (
            workingHours.map((hours, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center gap-4'>
                  <span className='font-medium text-gray-800 min-w-[100px]'>
                    {DAYS_OF_WEEK.find((d) => d.value === hours.dayOfWeek)?.label}
                  </span>
                  <span className='text-gray-600'>
                    {hours.startTime} - {hours.endTime}
                  </span>
                </div>
                <span className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                  Active
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
