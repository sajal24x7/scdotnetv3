import { format, formatDistanceToNow } from 'date-fns';

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
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format a date without the year for display (e.g., "April 28")
 * 
 * @param date The date to format
 * @returns Formatted date string without year
 */
export function formatDateWithoutYear(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM d');
}

/**
 * Format a date with time for display (e.g., "April 28, 2025 at 06:38")
 * 
 * @param date The date to format
 * @returns Formatted date string with time
 */
export function formatDateWithTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM d, yyyy \'at\' HH:mm');
}



/**
 * Format a date as Month Year (e.g., "August 2025")
 * 
 * @param date The date to format
 * @returns Formatted date string in Month Year format
 */
export function formatMonthYear(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM yyyy');
}

/**
 * Format a date range as "start date - end date" (e.g., "February 2025 - September 2025")
 * 
 * @param startDate The start date
 * @param endDate The end date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const endDateObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const startFormatted = format(startDateObj, 'MMMM yyyy');
  const endFormatted = format(endDateObj, 'MMMM yyyy');

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Format a date as a relative distance from now (e.g., "2 days ago")
 *
 * @param date The date to format
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}