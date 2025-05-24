'use client';

import { Clock, Plus, Save, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WorkingHours {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

interface WorkingHoursSectionProps {
  therapistId: number;
}

export function WorkingHoursSection({ therapistId }: WorkingHoursSectionProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWorkingHours();
  }, [therapistId]);

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/therapist/working-hours?therapistId=${therapistId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setWorkingHours(data.workingHours || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load working hours');
    } finally {
      setLoading(false);
    }
  };

  const addWorkingHour = () => {
    setWorkingHours([
      ...workingHours,
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: true,
      },
    ]);
  };

  const updateWorkingHour = (
    index: number,
    field: keyof WorkingHours,
    value: string | number | boolean,
  ) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  const removeWorkingHour = (index: number) => {
    setWorkingHours(workingHours.filter((_, i) => i !== index));
  };

  const saveWorkingHours = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/therapist/working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId,
          workingHours,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save working hours');
      }

      setWorkingHours(data.workingHours);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save working hours');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='border-t border-gray-200 p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <Clock className='h-5 w-5 text-purple-600' />
          <h4 className='text-md font-semibold text-gray-900'>Working Hours</h4>
        </div>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='border-t border-gray-200 p-6'>
      <div className='flex items-center gap-3 mb-4'>
        <Clock className='h-5 w-5 text-purple-600' />
        <h4 className='text-md font-semibold text-gray-900'>Working Hours</h4>
      </div>

      <p className='text-sm text-gray-600 mb-4'>
        Set your availability for client bookings. These hours will be used to generate available
        time slots.
      </p>

      <div className='space-y-3 mb-4'>
        {workingHours.map((hours, index) => (
          <div key={index} className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
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
              className='text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors'
              aria-label='Remove working hours'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </div>
        ))}
      </div>

      <div className='flex gap-3'>
        <button
          onClick={addWorkingHour}
          className='flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm'
        >
          <Plus className='h-4 w-4' />
          Add Hours
        </button>

        <button
          onClick={saveWorkingHours}
          disabled={saving}
          className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm'
        >
          {saving ? (
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
          ) : (
            <Save className='h-4 w-4' />
          )}
          {saving ? 'Saving...' : 'Save Hours'}
        </button>
      </div>

      {success && (
        <p className='text-green-600 font-medium mt-3 text-sm'>Working hours saved successfully!</p>
      )}

      {error && <p className='text-red-600 font-medium mt-3 text-sm'>Error: {error}</p>}
    </div>
  );
}
