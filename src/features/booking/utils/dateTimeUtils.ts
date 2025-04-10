import { DateTime } from 'luxon';

export const SUPPORTED_TIMEZONES = {
  'America/New_York': 'EST',
  'America/Chicago': 'CST',
  'America/Denver': 'MST',
  'America/Los_Angeles': 'PST',
} as const;

export type TimezoneIdentifier = keyof typeof SUPPORTED_TIMEZONES;

function validateTimezone(timezone: string): asserts timezone is TimezoneIdentifier {
  if (!Object.keys(SUPPORTED_TIMEZONES).includes(timezone)) {
    throw new Error(
      `Invalid timezone: ${timezone}. Supported timezones are: ${Object.keys(SUPPORTED_TIMEZONES).join(', ')}`,
    );
  }
}

export function parseDateTime(date: string, time: string, timezone: string): DateTime {
  try {
    // Handle ISO 8601 formatted time or separate date and time
    const parsedTime = time.includes('T')
      ? DateTime.fromISO(time).setZone(timezone)
      : DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm', { zone: timezone });

    if (!parsedTime.isValid) {
      throw new Error(`Invalid date/time: ${parsedTime.invalidReason}`);
    }

    return parsedTime;
  } catch (error) {
    throw new Error(
      `Failed to parse date/time: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export function formatDateTime(date: DateTime, timezone: string) {
  validateTimezone(timezone);

  try {
    const formattedDate = date.setZone(timezone);

    return {
      date: formattedDate.toFormat('cccc, MMMM d, yyyy'),
      time: formattedDate.toFormat('h:mm a'),
      timezone: SUPPORTED_TIMEZONES[timezone as TimezoneIdentifier],
    };
  } catch (error) {
    throw new Error(
      `Failed to format date/time: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export function isValidFutureDate(date: string): boolean {
  try {
    const selectedDate = DateTime.fromISO(date);
    const today = DateTime.now().startOf('day');

    return selectedDate >= today;
  } catch {
    return false;
  }
}

export function convertTo24Hour(time12h: string): string {
  try {
    const parsedTime = DateTime.fromFormat(time12h, 'h:mm a');

    if (!parsedTime.isValid) {
      throw new Error(`Invalid time format: ${time12h}`);
    }

    return parsedTime.toFormat('HH:mm');
  } catch (error) {
    throw new Error(
      `Failed to convert time to 24-hour format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
