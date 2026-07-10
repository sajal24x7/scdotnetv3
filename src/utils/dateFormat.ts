import { formatDistanceToNow } from 'date-fns';

/**
 * The timezone all on-site date/time displays are pinned to, regardless of
 * the timezone the build runs in (Cloudflare/GitHub Actions build in UTC).
 * Change this single value to change the site's displayed timezone.
 */
export const SITE_TIMEZONE = 'Europe/Helsinki';

function toDate(date: Date | string): Date {
  return typeof date === 'string' ? new Date(date) : date;
}

/**
 * Format a date for display
 *
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: SITE_TIMEZONE }).format(toDate(date));
}

/**
 * Format a date without the year for display (e.g., "April 28")
 *
 * @param date The date to format
 * @returns Formatted date string without year
 */
export function formatDateWithoutYear(date: Date | string): string {
  return formatDate(date, { month: 'long', day: 'numeric' });
}

/**
 * Format a date with time for display (e.g., "April 28, 2025 at 06:38")
 *
 * @param date The date to format
 * @returns Formatted date string with time
 */
export function formatDateWithTime(date: Date | string): string {
  const dateObj = toDate(date);
  const datePart = formatDate(dateObj, { year: 'numeric', month: 'long', day: 'numeric' });
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: SITE_TIMEZONE,
  }).format(dateObj);
  return `${datePart} at ${timePart}`;
}



/**
 * Format a date as Month Year (e.g., "August 2025")
 *
 * @param date The date to format
 * @returns Formatted date string in Month Year format
 */
export function formatMonthYear(date: Date | string): string {
  return formatDate(date, { month: 'long', year: 'numeric' });
}

/**
 * Format a date range as "start date - end date" (e.g., "February 2025 - September 2025")
 *
 * @param startDate The start date
 * @param endDate The end date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  return `${formatMonthYear(startDate)} - ${formatMonthYear(endDate)}`;
}

/**
 * Format a date as a relative distance from now (e.g., "2 days ago")
 *
 * @param date The date to format
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date | string): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true });
}
