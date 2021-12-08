import { LOCALE } from './locale'

/**
 * Format a date-ish object to a locale-friendly string
 */
export function formatDate(
  date?: Date | string | number,
  defaultValue: string = '',
  options: Intl.DateTimeFormatOptions = {}
) {
  if (!date) {
    return defaultValue
  }
  // https://css-tricks.com/how-to-convert-a-date-string-into-a-human-readable-format/
  return new Date(date).toLocaleDateString(LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  })
}

export function formatTime(date: Date | string | number) {
  return new Date(date).toLocaleTimeString(LOCALE, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRecurringInterval(interval?: string | null) {
  if (!interval) {
    return 'One-time'
  }
  // month -> Monthly, year -> Yearly
  return interval.slice(0, 1).toUpperCase() + interval.slice(1) + 'ly'
}
