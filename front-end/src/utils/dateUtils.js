// utils/dateUtils.js
import { format, parse, parseISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Get user's timezone (default to Ethiopia if not detected)
const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'Africa/Addis_Ababa'; // Ethiopia timezone
  }
};

// Convert UTC DB value to local datetime-local format (YYYY-MM-DDThh:mm)
export const formatUTCToLocalDateTime = (utcDateString) => {
  if (!utcDateString) return '';
  try {
    const date = parseISO(utcDateString);
    const timezone = getUserTimezone();
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Convert local datetime input to UTC for storage
export const formatLocalToUTC = (localDateTimeString) => {
  if (!localDateTimeString) return '';
  try {
    const timezone = getUserTimezone();
    const date = parse(localDateTimeString, "yyyy-MM-dd'T'HH:mm", new Date());
    const utcDate = fromZonedTime(date, timezone);
    return utcDate.toISOString();
  } catch (error) {
    console.error('Date conversion error:', error);
    return '';
  }
};

// Convert UTC to local date only (YYYY-MM-DD)
export const formatUTCToLocalDate = (utcDateString) => {
  if (!utcDateString) return '';
  try {
    const date = parseISO(utcDateString);
    const timezone = getUserTimezone();
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
};

// Convert local date to UTC
export const formatLocalDateToUTC = (localDateString) => {
  if (!localDateString) return '';
  try {
    const timezone = getUserTimezone();
    const date = parse(localDateString, 'yyyy-MM-dd', new Date());
    const utcDate = fromZonedTime(date, timezone);
    return utcDate.toISOString();
  } catch (error) {
    return '';
  }
};

// Format for display (local timezone, 12-hour format)
export const formatDisplayDate = (utcDateString, includeTime = true) => {
  if (!utcDateString) return 'N/A';
  try {
    const date = parseISO(utcDateString);
    const timezone = getUserTimezone();
    const zonedDate = toZonedTime(date, timezone);
    
    if (includeTime) {
      return format(zonedDate, 'MM/dd/yyyy, hh:mm a');
    }
    return format(zonedDate, 'MM/dd/yyyy');
  } catch (error) {
    return 'N/A';
  }
};