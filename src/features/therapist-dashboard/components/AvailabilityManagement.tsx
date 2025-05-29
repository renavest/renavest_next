'use client';

import { Calendar, Clock, X, Eye } from 'lucide-react';
import { DateTime } from 'luxon';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';

import { createDate } from '@/src/utils/timezone';

import { BlockedTimeView } from './availability/BlockedTimeView';
import { OverviewView } from './availability/OverviewView';
import { WorkingHoursView } from './availability/WorkingHoursView';

interface TimeSlot {
  start: string;
  end: string;
}

interface WorkingHours {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

interface BlockedTime {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  isRecurring: boolean;
}

interface AvailabilityManagementProps {
  therapistId: number;
}

const DEFAULT_WORKING_HOURS: WorkingHours = {
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '17:00',
  isRecurring: true,
};

type ViewMode = 'overview' | 'working-hours' | 'blocked-time';

export function AvailabilityManagement({ therapistId }: AvailabilityManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now());
  const [currentMonth, setCurrentMonth] = useState<DateTime>(DateTime.now().startOf('month'));

  // Data states
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [savingWorkingHours, setSavingWorkingHours] = useState(false);
  const [savingBlockedTime, setSavingBlockedTime] = useState(false);

  // Form states
  const [editingWorkingHours, setEditingWorkingHours] = useState(false);
  const [newBlockedTime, setNewBlockedTime] = useState<Partial<BlockedTime>>({});
  const [showAddBlockedTime, setShowAddBlockedTime] = useState(false);

  useEffect(() => {
    fetchData();
  }, [therapistId, currentMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchWorkingHours(), fetchBlockedTimes(), fetchAvailability()]);
    } catch (error) {
      console.error('Error fetching availability data:', error);
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkingHours = async () => {
    try {
      const response = await fetch(`/api/therapist/working-hours?therapistId=${therapistId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch working hours');
      }

      setWorkingHours(data.workingHours || []);

      // If these are default hours (not saved by user), show them in edit mode
      if (data.isDefault && data.workingHours?.length > 0) {
        // Auto-enter edit mode so therapist can see and modify default hours
        setEditingWorkingHours(true);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
    }
  };

  const fetchBlockedTimes = async () => {
    try {
      const response = await fetch(
        `/api/therapist/blocked-times?therapistId=${therapistId}&month=${currentMonth.toISODate()}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch blocked times');
      }

      setBlockedTimes(data.blockedTimes || []);
    } catch (error) {
      console.error('Error fetching blocked times:', error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const startDate = currentMonth.startOf('month');
      const endDate = currentMonth.endOf('month');
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await fetch(
        `/api/sessions/availability?therapistId=${therapistId}&startDate=${startDate.toISO()}&endDate=${endDate.toISO()}&timezone=${timezone}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch availability');
      }

      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const saveWorkingHours = async () => {
    setSavingWorkingHours(true);
    try {
      const response = await fetch('/api/therapist/working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId, workingHours }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success('Working hours updated successfully');
      setEditingWorkingHours(false);
      await fetchAvailability(); // Refresh availability after updating working hours
    } catch (error) {
      console.error('Error saving working hours:', error);
      toast.error('Failed to save working hours');
    } finally {
      setSavingWorkingHours(false);
    }
  };

  const addWorkingHour = () => {
    setWorkingHours([...workingHours, { ...DEFAULT_WORKING_HOURS }]);
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

  const saveBlockedTime = async () => {
    if (!newBlockedTime.date || !newBlockedTime.startTime || !newBlockedTime.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSavingBlockedTime(true);
    try {
      const response = await fetch('/api/therapist/blocked-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId,
          blockedTime: {
            ...newBlockedTime,
            isRecurring: newBlockedTime.isRecurring || false,
          },
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success('Blocked time added successfully');
      setShowAddBlockedTime(false);
      setNewBlockedTime({});
      await Promise.all([fetchBlockedTimes(), fetchAvailability()]);
    } catch (error) {
      console.error('Error saving blocked time:', error);
      toast.error('Failed to save blocked time');
    } finally {
      setSavingBlockedTime(false);
    }
  };

  const removeBlockedTime = async (id: number) => {
    try {
      const response = await fetch(`/api/therapist/blocked-times/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success('Blocked time removed');
      await Promise.all([fetchBlockedTimes(), fetchAvailability()]);
    } catch (error) {
      console.error('Error removing blocked time:', error);
      toast.error('Failed to remove blocked time');
    }
  };

  // Calculate availability stats
  const availabilityStats = useMemo(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = DateTime.now().setZone(timezone);
    const thisWeek = availableSlots.filter((slot) => {
      const slotDate = createDate(slot.start, timezone);
      return slotDate >= today && slotDate <= today.plus({ days: 7 });
    });
    const nextWeek = availableSlots.filter((slot) => {
      const slotDate = createDate(slot.start, timezone);
      return slotDate > today.plus({ days: 7 }) && slotDate <= today.plus({ days: 14 });
    });

    return {
      thisWeek: thisWeek.length,
      nextWeek: nextWeek.length,
      total: availableSlots.length,
    };
  }, [availableSlots]);

  // Get available dates for calendar
  const availableDates = useMemo(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const set = new Set<string>();
    availableSlots.forEach((slot: TimeSlot) => {
      set.add(createDate(slot.start, timezone).toISODate()!);
    });
    return set;
  }, [availableSlots]);

  // Get slots for selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = DateTime.now().setZone(timezone).startOf('day');

    // If the selected date is in the past, return no slots
    if (selectedDate.startOf('day') < today) {
      return [];
    }

    return availableSlots.filter((slot: TimeSlot) => {
      const slotDate = createDate(slot.start, timezone);
      return slotDate.toISODate() === selectedDate.toISODate();
    });
  }, [selectedDate, availableSlots]);

  if (loading) {
    return (
      <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Calendar className='h-6 w-6 text-purple-600' />
            <h2 className='text-xl font-semibold text-gray-800'>Availability Management</h2>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'overview'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className='w-4 h-4 inline mr-1' />
              Overview
            </button>
            <button
              onClick={() => setViewMode('working-hours')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'working-hours'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className='w-4 h-4 inline mr-1' />
              Working Hours
            </button>
            <button
              onClick={() => setViewMode('blocked-time')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'blocked-time'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className='w-4 h-4 inline mr-1' />
              Blocked Time
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-6'>
        {viewMode === 'overview' && (
          <OverviewView
            availabilityStats={availabilityStats}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            availableDates={availableDates}
            slotsForSelectedDate={slotsForSelectedDate}
            _workingHours={workingHours}
            _blockedTimes={blockedTimes}
          />
        )}

        {viewMode === 'working-hours' && (
          <WorkingHoursView
            workingHours={workingHours}
            editingWorkingHours={editingWorkingHours}
            setEditingWorkingHours={setEditingWorkingHours}
            savingWorkingHours={savingWorkingHours}
            addWorkingHour={addWorkingHour}
            updateWorkingHour={updateWorkingHour}
            removeWorkingHour={removeWorkingHour}
            saveWorkingHours={saveWorkingHours}
          />
        )}

        {viewMode === 'blocked-time' && (
          <BlockedTimeView
            blockedTimes={blockedTimes}
            showAddBlockedTime={showAddBlockedTime}
            setShowAddBlockedTime={setShowAddBlockedTime}
            newBlockedTime={newBlockedTime}
            setNewBlockedTime={setNewBlockedTime}
            savingBlockedTime={savingBlockedTime}
            saveBlockedTime={saveBlockedTime}
            removeBlockedTime={removeBlockedTime}
            selectedDate={selectedDate}
            setNewBlockedTimeDate={(date: string) => setNewBlockedTime({ ...newBlockedTime, date })}
          />
        )}
      </div>
    </div>
  );
}

// Export types for the sub-components
export type { TimeSlot, WorkingHours, BlockedTime };
