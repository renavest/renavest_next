import { EventScheduledEvent } from 'react-calendly';

export type CalendlyEventDetails = {
  start_time?: string;
  end_time?: string;
  uri?: string;
};

export type BookingDetails = {
  date: string;
  startTime: string;
  endTime: string;
};

// Extract booking details parsing logic to a separate function
export const parseBookingDetails = (eventDetails: CalendlyEventDetails): BookingDetails => {
  const startTimeStr = eventDetails.start_time || new Date().toISOString();
  const endTimeStr = eventDetails.end_time || new Date().toISOString();

  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  return {
    date: startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    startTime: startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    endTime: endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

// Helper to format date for display
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper to format time for display
export const formatTimeForDisplay = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
