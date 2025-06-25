import type { WorkingHours } from '@/src/shared/types';
import type { BlockedTime } from '@/src/shared/types';

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
