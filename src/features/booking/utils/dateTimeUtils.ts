export const SUPPORTED_TIMEZONES = {
  'America/New_York': 'EST',
  'America/Chicago': 'CST',
  'America/Denver': 'MST',
  'America/Los_Angeles': 'PST',
} as const;

export type TimezoneIdentifier = keyof typeof SUPPORTED_TIMEZONES;

export interface TimezoneOption {
  value: TimezoneIdentifier;
  label: string;
}

export function createTimestamp(date: string, time: string, timezone: TimezoneIdentifier): Date {
  // Convert 12-hour time to 24-hour
  const [timeStr, modifier] = time.split(' ');
  let [hours, minutes] = timeStr.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  // Create a date object in the user's selected timezone
  const userDate = new Date(date);
  userDate.setHours(hours, minutes, 0, 0);

  // Convert to UTC timestamp
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });

  const parts = formatter.formatToParts(userDate);
  const dateParts = {
    year: parseInt(parts.find((p) => p.type === 'year')?.value || '0'),
    month: parseInt(parts.find((p) => p.type === 'month')?.value || '1') - 1,
    day: parseInt(parts.find((p) => p.type === 'day')?.value || '1'),
    hour: hours,
    minute: minutes,
  };

  return new Date(
    Date.UTC(dateParts.year, dateParts.month, dateParts.day, dateParts.hour, dateParts.minute),
  );
}

export function formatDateTime(date: Date, timezone: TimezoneIdentifier) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });

  return formatter.format(date);
}

export function isValidFutureDate(date: string): boolean {
  try {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      return false;
    }

    return selectedDate >= today;
  } catch {
    return false;
  }
}

export function convertTo24Hour(time12h: string): string {
  try {
    const [time, modifier] = time12h.split(' ');
    if (!time || !modifier) {
      throw new Error(`Invalid time format: ${time12h}. Expected format: HH:mm AM/PM`);
    }

    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Invalid time components: hours=${hours}, minutes=${minutes}`);
    }

    let adjustedHours = hours;
    if (modifier === 'PM' && hours !== 12) {
      adjustedHours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      adjustedHours = 0;
    }

    return `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    throw new Error(
      `Failed to convert time to 24-hour format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
