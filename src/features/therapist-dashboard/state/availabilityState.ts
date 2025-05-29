import { signal, computed } from '@preact-signals/safe-react';
import { DateTime } from 'luxon';
import { toast } from 'sonner';

// Types
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

interface AvailabilityStats {
  thisWeek: number;
  nextWeek: number;
  total: number;
}

type ViewMode = 'overview' | 'working-hours' | 'blocked-time';

// Core state signals
export const therapistIdSignal = signal<number | null>(null);
export const selectedDateSignal = signal<DateTime>(DateTime.now());
export const currentMonthSignal = signal<DateTime>(DateTime.now().startOf('month'));
export const viewModeSignal = signal<ViewMode>('overview');

// Data signals
export const workingHoursSignal = signal<WorkingHours[]>([]);
export const blockedTimesSignal = signal<BlockedTime[]>([]);
export const availableSlotsSignal = signal<TimeSlot[]>([]);

// Loading state signals
export const loadingSignal = signal(true);
export const savingWorkingHoursSignal = signal(false);
export const savingBlockedTimeSignal = signal(false);

// Form state signals
export const editingWorkingHoursSignal = signal(false);
export const newBlockedTimeSignal = signal<Partial<BlockedTime>>({});
export const showAddBlockedTimeSignal = signal(false);

// Default working hours
const DEFAULT_WORKING_HOURS: WorkingHours = {
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '17:00',
  isRecurring: true,
};

// Computed signals
export const availabilityStatsSignal = computed<AvailabilityStats>(() => {
  const slots = availableSlotsSignal.value;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = DateTime.now().setZone(timezone);

  const thisWeek = slots.filter((slot) => {
    const slotDate = DateTime.fromISO(slot.start, { zone: timezone });
    return slotDate >= today && slotDate <= today.plus({ days: 7 });
  });

  const nextWeek = slots.filter((slot) => {
    const slotDate = DateTime.fromISO(slot.start, { zone: timezone });
    return slotDate > today.plus({ days: 7 }) && slotDate <= today.plus({ days: 14 });
  });

  return {
    thisWeek: thisWeek.length,
    nextWeek: nextWeek.length,
    total: slots.length,
  };
});

export const availableDatesSignal = computed<Set<string>>(() => {
  const slots = availableSlotsSignal.value;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const set = new Set<string>();

  slots.forEach((slot: TimeSlot) => {
    const date = DateTime.fromISO(slot.start, { zone: timezone }).toISODate();
    if (date) set.add(date);
  });

  return set;
});

export const slotsForSelectedDateSignal = computed<TimeSlot[]>(() => {
  const selectedDate = selectedDateSignal.value;
  const slots = availableSlotsSignal.value;

  if (!selectedDate) return [];

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = DateTime.now().setZone(timezone).startOf('day');

  // If the selected date is in the past, return no slots
  if (selectedDate.startOf('day') < today) {
    return [];
  }

  return slots.filter((slot: TimeSlot) => {
    const slotDate = DateTime.fromISO(slot.start, { zone: timezone });
    return slotDate.toISODate() === selectedDate.toISODate();
  });
});

// API functions
export const fetchData = async (therapistId: number) => {
  loadingSignal.value = true;
  try {
    await Promise.all([
      fetchWorkingHours(therapistId),
      fetchBlockedTimes(therapistId),
      fetchAvailability(therapistId),
    ]);
  } catch (error) {
    console.error('Error fetching availability data:', error);
    toast.error('Failed to load availability data');
  } finally {
    loadingSignal.value = false;
  }
};

export const fetchWorkingHours = async (therapistId: number) => {
  try {
    const response = await fetch(`/api/therapist/working-hours?therapistId=${therapistId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch working hours');
    }

    workingHoursSignal.value = data.workingHours || [];

    // If these are default hours (not saved by user), show them in edit mode
    if (data.isDefault && data.workingHours?.length > 0) {
      editingWorkingHoursSignal.value = true;
    }
  } catch (error) {
    console.error('Error fetching working hours:', error);
  }
};

export const fetchBlockedTimes = async (therapistId: number) => {
  try {
    const currentMonth = currentMonthSignal.value;
    const response = await fetch(
      `/api/therapist/blocked-times?therapistId=${therapistId}&month=${currentMonth.toISODate()}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch blocked times');
    }

    blockedTimesSignal.value = data.blockedTimes || [];
  } catch (error) {
    console.error('Error fetching blocked times:', error);
  }
};

export const fetchAvailability = async (therapistId: number) => {
  try {
    const currentMonth = currentMonthSignal.value;
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

    availableSlotsSignal.value = data.slots || [];
  } catch (error) {
    console.error('Error fetching availability:', error);
  }
};

export const saveWorkingHours = async (therapistId: number) => {
  savingWorkingHoursSignal.value = true;
  try {
    const response = await fetch('/api/therapist/working-hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ therapistId, workingHours: workingHoursSignal.value }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    toast.success('Working hours updated successfully');
    editingWorkingHoursSignal.value = false;
    await fetchAvailability(therapistId); // Refresh availability after updating working hours
  } catch (error) {
    console.error('Error saving working hours:', error);
    toast.error('Failed to save working hours');
  } finally {
    savingWorkingHoursSignal.value = false;
  }
};

export const addWorkingHour = () => {
  workingHoursSignal.value = [...workingHoursSignal.value, { ...DEFAULT_WORKING_HOURS }];
};

export const updateWorkingHour = (
  index: number,
  field: keyof WorkingHours,
  value: string | number | boolean,
) => {
  const updated = [...workingHoursSignal.value];
  updated[index] = { ...updated[index], [field]: value };
  workingHoursSignal.value = updated;
};

export const removeWorkingHour = (index: number) => {
  workingHoursSignal.value = workingHoursSignal.value.filter((_, i) => i !== index);
};

export const saveBlockedTime = async (therapistId: number) => {
  const newBlockedTime = newBlockedTimeSignal.value;

  if (!newBlockedTime.date || !newBlockedTime.startTime || !newBlockedTime.endTime) {
    toast.error('Please fill in all required fields');
    return;
  }

  savingBlockedTimeSignal.value = true;
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
    showAddBlockedTimeSignal.value = false;
    newBlockedTimeSignal.value = {};
    await Promise.all([fetchBlockedTimes(therapistId), fetchAvailability(therapistId)]);
  } catch (error) {
    console.error('Error saving blocked time:', error);
    toast.error('Failed to save blocked time');
  } finally {
    savingBlockedTimeSignal.value = false;
  }
};

export const removeBlockedTime = async (therapistId: number, id: number) => {
  try {
    const response = await fetch(`/api/therapist/blocked-times/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    toast.success('Blocked time removed');
    await Promise.all([fetchBlockedTimes(therapistId), fetchAvailability(therapistId)]);
  } catch (error) {
    console.error('Error removing blocked time:', error);
    toast.error('Failed to remove blocked time');
  }
};

// Export types for use in components
export type { TimeSlot, WorkingHours, BlockedTime, AvailabilityStats, ViewMode };
