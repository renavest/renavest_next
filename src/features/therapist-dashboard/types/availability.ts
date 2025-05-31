export interface WorkingHours {
  id?: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
}

export interface BlockedTime {
  id: string;
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
  reason?: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  recurrenceEnd?: string; // ISO string
}

export interface AvailabilityOverview {
  totalAvailableHours: number;
  bookedHours: number;
  blockedHours: number;
  availableHours: number;
  upcomingBlockedSlots: BlockedTime[];
  nextAvailableSlot?: {
    date: string;
    time: string;
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  isBlocked: boolean;
  clientName?: string;
}
