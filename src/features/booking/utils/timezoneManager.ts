import { DateTime } from 'luxon';

/**
 * Centralized timezone management for the booking system
 * This ensures consistent timezone handling across all components
 */

export type SupportedTimezone =
  | 'America/New_York'
  | 'America/Chicago'
  | 'America/Denver'
  | 'America/Los_Angeles'
  | 'America/Phoenix'
  | 'Europe/London'
  | 'Europe/Paris'
  | 'Europe/Berlin'
  | 'Asia/Tokyo'
  | 'Asia/Shanghai'
  | 'Australia/Sydney'
  | 'UTC';

export const TIMEZONE_LABELS: Record<SupportedTimezone, string> = {
  'America/New_York': 'Eastern Time (ET)',
  'America/Chicago': 'Central Time (CT)',
  'America/Denver': 'Mountain Time (MT)',
  'America/Los_Angeles': 'Pacific Time (PT)',
  'America/Phoenix': 'Arizona Time (MST)',
  'Europe/London': 'London Time (GMT/BST)',
  'Europe/Paris': 'Paris Time (CET/CEST)',
  'Europe/Berlin': 'Berlin Time (CET/CEST)',
  'Asia/Tokyo': 'Tokyo Time (JST)',
  'Asia/Shanghai': 'Shanghai Time (CST)',
  'Australia/Sydney': 'Sydney Time (AEST/AEDT)',
  UTC: 'UTC',
};

export class TimezoneManager {
  private static instance: TimezoneManager;
  private userTimezone: SupportedTimezone;

  private constructor() {
    this.userTimezone = this.detectUserTimezone();
  }

  public static getInstance(): TimezoneManager {
    if (!TimezoneManager.instance) {
      TimezoneManager.instance = new TimezoneManager();
    }
    return TimezoneManager.instance;
  }

  /**
   * Detects user's timezone and maps it to a supported timezone
   */
  private detectUserTimezone(): SupportedTimezone {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Direct match
      if (this.isSupportedTimezone(detected)) {
        return detected;
      }

      // Fallback mapping for common timezones
      const fallbackMap: Record<string, SupportedTimezone> = {
        'America/Detroit': 'America/New_York',
        'America/Indiana/Indianapolis': 'America/New_York',
        'America/Kentucky/Louisville': 'America/New_York',
        'America/Montreal': 'America/New_York',
        'America/Toronto': 'America/New_York',
        'America/Winnipeg': 'America/Chicago',
        'America/Mexico_City': 'America/Chicago',
        'America/Boise': 'America/Denver',
        'America/Edmonton': 'America/Denver',
        'America/Vancouver': 'America/Los_Angeles',
        'America/Tijuana': 'America/Los_Angeles',
        'Europe/Dublin': 'Europe/London',
        'Europe/Amsterdam': 'Europe/Paris',
        'Europe/Brussels': 'Europe/Paris',
        'Europe/Madrid': 'Europe/Paris',
        'Europe/Rome': 'Europe/Paris',
        'Europe/Vienna': 'Europe/Berlin',
        'Europe/Zurich': 'Europe/Berlin',
        'Asia/Seoul': 'Asia/Tokyo',
        'Asia/Hong_Kong': 'Asia/Shanghai',
        'Asia/Singapore': 'Asia/Shanghai',
        'Australia/Melbourne': 'Australia/Sydney',
        'Australia/Brisbane': 'Australia/Sydney',
      };

      return fallbackMap[detected] || 'America/New_York';
    } catch {
      return 'America/New_York';
    }
  }

  private isSupportedTimezone(timezone: string): timezone is SupportedTimezone {
    return Object.keys(TIMEZONE_LABELS).includes(timezone);
  }

  /**
   * Gets the current user timezone
   */
  public getUserTimezone(): SupportedTimezone {
    return this.userTimezone;
  }

  /**
   * Sets the user timezone (for manual override)
   */
  public setUserTimezone(timezone: SupportedTimezone): void {
    this.userTimezone = timezone;
  }

  /**
   * Creates a DateTime object in the user's timezone
   */
  public createDateTime(date?: Date | string): DateTime {
    if (!date) {
      return DateTime.now().setZone(this.userTimezone);
    }
    return DateTime.fromJSDate(typeof date === 'string' ? new Date(date) : date).setZone(
      this.userTimezone,
    );
  }

  /**
   * Converts a DateTime from one timezone to another
   */
  public convertTimezone(
    dateTime: DateTime | Date | string,
    fromTimezone: SupportedTimezone,
    toTimezone: SupportedTimezone,
  ): DateTime {
    let dt: DateTime;

    if (dateTime instanceof DateTime) {
      dt = dateTime.setZone(fromTimezone);
    } else {
      const jsDate = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
      dt = DateTime.fromJSDate(jsDate).setZone(fromTimezone);
    }

    return dt.setZone(toTimezone);
  }

  /**
   * Formats a DateTime for display in the user's timezone
   */
  public formatForDisplay(
    dateTime: DateTime | Date | string,
    options: {
      timezone?: SupportedTimezone;
      includeTimezone?: boolean;
      format?: 'date' | 'time' | 'datetime' | 'full';
    } = {},
  ): string {
    const { timezone = this.userTimezone, includeTimezone = true, format = 'datetime' } = options;

    let dt: DateTime;
    if (dateTime instanceof DateTime) {
      dt = dateTime.setZone(timezone);
    } else {
      const jsDate = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
      dt = DateTime.fromJSDate(jsDate).setZone(timezone);
    }

    switch (format) {
      case 'date':
        return dt.toFormat('cccc, LLLL d, yyyy');
      case 'time':
        return includeTimezone ? dt.toFormat('h:mm a ZZZZ') : dt.toFormat('h:mm a');
      case 'datetime':
        return includeTimezone
          ? dt.toFormat('cccc, LLLL d, yyyy h:mm a ZZZZ')
          : dt.toFormat('cccc, LLLL d, yyyy h:mm a');
      case 'full':
        return dt.toFormat('cccc, LLLL d, yyyy h:mm a ZZZZ');
      default:
        return dt.toISO() || '';
    }
  }

  /**
   * Formats a DateTime for email templates
   */
  public formatForEmail(
    dateTime: DateTime | Date | string,
    timezone: SupportedTimezone,
  ): {
    date: string;
    time: string;
    timezone: string;
    full: string;
  } {
    let dt: DateTime;
    if (dateTime instanceof DateTime) {
      dt = dateTime.setZone(timezone);
    } else {
      const jsDate = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
      dt = DateTime.fromJSDate(jsDate).setZone(timezone);
    }

    return {
      date: dt.toFormat('cccc, LLLL d, yyyy'),
      time: dt.toFormat('h:mm a'),
      timezone: TIMEZONE_LABELS[timezone],
      full: dt.toFormat('cccc, LLLL d, yyyy h:mm a ZZZZ'),
    };
  }

  /**
   * Validates if a time slot is in the future
   */
  public isSlotInFuture(
    slotStart: DateTime | Date | string,
    timezone: SupportedTimezone = this.userTimezone,
  ): boolean {
    let dt: DateTime;
    if (slotStart instanceof DateTime) {
      dt = slotStart.setZone(timezone);
    } else {
      const jsDate = typeof slotStart === 'string' ? new Date(slotStart) : slotStart;
      dt = DateTime.fromJSDate(jsDate).setZone(timezone);
    }

    const now = DateTime.now().setZone(timezone);
    return dt > now;
  }

  /**
   * Gets all supported timezones for UI selection
   */
  public getSupportedTimezones(): Array<{ value: SupportedTimezone; label: string }> {
    return Object.entries(TIMEZONE_LABELS).map(([value, label]) => ({
      value: value as SupportedTimezone,
      label,
    }));
  }

  /**
   * Parses a date and time string in a specific timezone
   */
  public parseDateTime(date: string, time: string, timezone: SupportedTimezone): DateTime {
    const dateTimeString = `${date} ${time}`;
    const dt = DateTime.fromFormat(dateTimeString, 'yyyy-MM-dd HH:mm', {
      zone: timezone,
    });

    if (!dt.isValid) {
      throw new Error(`Invalid date/time: ${dateTimeString} in timezone ${timezone}`);
    }

    return dt;
  }

  /**
   * Converts a booking slot to the therapist's timezone for storage
   */
  public convertBookingSlotForStorage(
    date: string,
    time: string,
    clientTimezone: SupportedTimezone,
    therapistTimezone: SupportedTimezone,
  ): {
    startTime: DateTime;
    endTime: DateTime;
    clientTimezone: SupportedTimezone;
    therapistTimezone: SupportedTimezone;
  } {
    const clientDateTime = this.parseDateTime(date, time, clientTimezone);
    const therapistDateTime = clientDateTime.setZone(therapistTimezone);
    const endTime = therapistDateTime.plus({ hours: 1 }); // Default 1-hour sessions

    return {
      startTime: therapistDateTime,
      endTime,
      clientTimezone,
      therapistTimezone,
    };
  }
}

// Export singleton instance
export const timezoneManager = TimezoneManager.getInstance();
