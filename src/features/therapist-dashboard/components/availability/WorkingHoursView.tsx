import { Plus, Trash2, Clock, Save, Edit3 } from 'lucide-react';

import type { WorkingHours } from '../AvailabilityManagement';

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

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

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
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!editingWorkingHours) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-800'>Working Hours</h3>
            <p className='text-gray-600 text-sm'>
              Set your regular working schedule. These times determine when clients can book
              sessions.
            </p>
          </div>
          <button
            onClick={() => setEditingWorkingHours(true)}
            className='flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
          >
            <Edit3 className='w-4 h-4' />
            Edit Hours
          </button>
        </div>

        {workingHours.length === 0 ? (
          <div className='text-center py-12'>
            <Clock className='w-16 h-16 text-gray-300 mx-auto mb-4' />
            <h4 className='text-lg font-medium text-gray-500 mb-2'>No Working Hours Set</h4>
            <p className='text-gray-400 mb-4'>
              Set your working hours to let clients know when you're available.
            </p>
            <button
              onClick={() => setEditingWorkingHours(true)}
              className='bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors'
            >
              Set Working Hours
            </button>
          </div>
        ) : (
          <div className='bg-gray-50 rounded-xl p-6'>
            <div className='grid gap-4'>
              {workingHours.map((hours, index) => {
                const dayName =
                  DAYS_OF_WEEK.find((d) => d.value === hours.dayOfWeek)?.label || 'Unknown';
                return (
                  <div
                    key={index}
                    className='flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                      <span className='font-medium text-gray-900'>{dayName}</span>
                    </div>
                    <div className='text-gray-600'>
                      {formatTime(hours.startTime)} - {formatTime(hours.endTime)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800'>Edit Working Hours</h3>
          <p className='text-gray-600 text-sm'>
            Configure your availability by setting working hours for each day of the week.
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => setEditingWorkingHours(false)}
            className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={saveWorkingHours}
            disabled={savingWorkingHours}
            className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
          >
            {savingWorkingHours ? (
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            ) : (
              <Save className='w-4 h-4' />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className='bg-gray-50 rounded-xl p-6'>
        <div className='space-y-4'>
          {workingHours.map((hours, index) => (
            <div key={index} className='bg-white border border-gray-200 rounded-lg p-4'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Day of Week
                  </label>
                  <select
                    value={hours.dayOfWeek}
                    onChange={(e) =>
                      updateWorkingHour(index, 'dayOfWeek', parseInt(e.target.value))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                  >
                    {DAYS_OF_WEEK.map((day) => (
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
                    value={hours.startTime}
                    onChange={(e) => updateWorkingHour(index, 'startTime', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>End Time</label>
                  <input
                    type='time'
                    value={hours.endTime}
                    onChange={(e) => updateWorkingHour(index, 'endTime', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                  />
                </div>

                <div className='flex justify-end'>
                  <button
                    onClick={() => removeWorkingHour(index)}
                    className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                    title='Remove working hours'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addWorkingHour}
            className='w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300'
          >
            <Plus className='w-4 h-4' />
            Add Working Hours
          </button>
        </div>

        {workingHours.length === 0 && (
          <div className='text-center py-8'>
            <Clock className='w-12 h-12 text-gray-300 mx-auto mb-2' />
            <p className='text-gray-500 mb-4'>
              No working hours configured. Add your first set of working hours to get started.
            </p>
          </div>
        )}
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h4 className='font-medium text-blue-800 mb-2'>Tips for Setting Working Hours</h4>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>
            • You can set multiple time blocks for the same day (e.g., morning and afternoon
            sessions)
          </li>
          <li>• Leave gaps between sessions for breaks or administrative tasks</li>
          <li>• Consider your peak productivity hours when scheduling client sessions</li>
          <li>• Remember to account for different time zones if you serve clients remotely</li>
        </ul>
      </div>
    </div>
  );
}
