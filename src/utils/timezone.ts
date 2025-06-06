import { DateTime } from 'luxon';

/**
 * Creates a DateTime object from a date with timezone awareness
 * @param date The date to convert, can be a Date object or ISO string
 * @param timezone The timezone to use, e.g. 'UTC', 'America/New_York'
 * @returns A Luxon DateTime object in the specified timezone
 */
export const createDate = (date?: Date | string, timezone: string = 'UTC') => {
  if (!date) {
    return DateTime.now().setZone(timezone);
  }
  return DateTime.fromJSDate(typeof date === 'string' ? new Date(date) : date).setZone(timezone);
};

/**
 * Gets the current year
 */
export const getCurrentYear = () => {
  return DateTime.now().year;
};

/**
 * Gets the current month
 */
const getCurrentMonth = () => {
  return DateTime.now().month;
};

/**
 * Gets the current day
 */
const getCurrentDay = () => {
  return DateTime.now().day;
};

/**
 * Formats a DateTime object for email display
 */
function formatDateTimeForEmail(
  dateTime: DateTime,
  timezone: string,
): { date: string; time: string; full: string } {
  const dt = dateTime.setZone(timezone);
  return {
    date: dt.toFormat('cccc, LLLL d, yyyy'),
    time: dt.toFormat('h:mm a ZZZZ'),
    full: dt.toFormat('cccc, LLLL d, yyyy h:mm a ZZZZ'),
  };
}

export interface TimeSlot {
  start: string;
  end: string;
}
