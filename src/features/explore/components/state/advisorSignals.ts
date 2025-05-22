import { signal } from '@preact-signals/safe-react';

import { Advisor } from '@/src/shared/types';

// Core advisor state
export const advisorSignal = signal<Advisor | null>(null);
export const isOpenSignal = signal<boolean>(false);

// Enhanced marketplace state
export const selectedAdvisorIdSignal = signal<string | null>(null);
export const isGoogleCalendarConnectedSignal = signal<boolean | null>(null);
export const isCheckingIntegrationSignal = signal<boolean>(false);
export const marketplaceErrorSignal = signal<string | null>(null);

// Booking flow state
export const isBookingFlowActiveSignal = signal<boolean>(false);
export const bookingModeSignal = signal<'internal' | 'external' | null>(null);
