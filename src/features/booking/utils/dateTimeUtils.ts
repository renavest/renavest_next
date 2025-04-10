export const SUPPORTED_TIMEZONES = {
  'America/New_York': 'EST',
  'America/Chicago': 'CST',
  'America/Denver': 'MST',
  'America/Los_Angeles': 'PST',
} as const;

export type TimezoneIdentifier = keyof typeof SUPPORTED_TIMEZONES;

interface DateTimeComponents {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function validateTimezone(timezone: string): asserts timezone is TimezoneIdentifier {
  if (!Object.keys(SUPPORTED_TIMEZONES).includes(timezone)) {
    throw new Error(
      `Invalid timezone: ${timezone}. Supported timezones are: ${Object.keys(SUPPORTED_TIMEZONES).join(', ')}`,
    );
  }
}

export function parseDateTime(date: string, time: string, timezone: string): Date {
  try {
    // Handle ISO 8601 formatted time
    const parsedTime = time.includes('T')
      ? time.split('T')[1].slice(0, 5) // Extract HH:mm from ISO 8601
      : time;

    const [hours, minutes] = parsedTime.split(':').map(Number);

    // Create a date in the specified timezone
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }

    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Invalid time format: ${time}. Expected format: HH:mm or ISO 8601`);
    }

    // Use the Intl.DateTimeFormat to handle timezone conversions
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // Format the date in the target timezone
    const parts = formatter.formatToParts(dateObj);
    const components: DateTimeComponents = {
      year: parseInt(parts.find((p) => p.type === 'year')?.value || '0'),
      month: parseInt(parts.find((p) => p.type === 'month')?.value || '1') - 1,
      day: parseInt(parts.find((p) => p.type === 'day')?.value || '1'),
      hour: hours,
      minute: minutes,
    };

    return new Date(
      Date.UTC(
        components.year,
        components.month,
        components.day,
        components.hour,
        components.minute,
      ),
    );
  } catch (error) {
    throw new Error(
      `Failed to parse date/time: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export function formatDateTime(date: Date, timezone: string) {
  validateTimezone(timezone);

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const parts = formatter.formatToParts(date);

    return {
      date: [
        parts.find((p) => p.type === 'weekday')?.value,
        parts.find((p) => p.type === 'month')?.value,
        parts.find((p) => p.type === 'day')?.value,
        parts.find((p) => p.type === 'year')?.value,
      ]
        .filter(Boolean)
        .join(' '),

      time: [
        parts.find((p) => p.type === 'hour')?.value,
        ':',
        parts.find((p) => p.type === 'minute')?.value,
        ' ',
        parts.find((p) => p.type === 'dayPeriod')?.value,
      ]
        .filter(Boolean)
        .join(''),

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
