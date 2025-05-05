import { DateTime } from 'luxon';

export function convertTimeBetweenZones(
  inputTime: Date,
  fromTimezone: string,
  toTimezone: string,
): DateTime {
  // Convert input time to a DateTime object in the source timezone
  const sourceDateTime = DateTime.fromJSDate(inputTime).setZone(fromTimezone);

  // Convert to target timezone
  return sourceDateTime.setZone(toTimezone);
}

export function formatDateTimeForEmail(
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
