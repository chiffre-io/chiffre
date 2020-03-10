import ms from 'ms'
import dayjs, { Dayjs } from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import dayOfYear from 'dayjs/plugin/dayOfYear'

dayjs.extend(localizedFormat)
dayjs.extend(dayOfYear)

export interface TimeRange {
  before?: Dayjs
  after?: Dayjs
  step: number
}

export interface UseTimeRangeReturn {
  label: string
  previous?: TimeRange
  next?: TimeRange
}

export default function useTimeRange(range: TimeRange): UseTimeRangeReturn {
  if (!range.after && !range.before) {
    return {
      label: 'All time'
    }
  }
  const startsAtMidnight = range.after?.startOf('day').isSame(range.after)
  const endsAtMidnight = range.before?.startOf('day').isSame(range.before)
  if (!range.before) {
    return {
      label: `From ${range.after.format(startsAtMidnight ? 'LL' : 'LLL')}`
    }
  }
  if (!range.after) {
    return {
      label: `Up to ${range.before.format(endsAtMidnight ? 'LL' : 'LLL')}`
    }
  }

  if (range.after.isAfter(range.before)) {
    // todo: Report to Sentry
    return {
      label: 'Invalid time range'
    }
  }
  if (range.after.isSame(range.before)) {
    // todo: Report to Sentry
    return {
      label: 'Invalid time range'
    }
  }

  const deltaYears = range.before.diff(range.after, 'year')
  if (deltaYears > 0) {
    if (range.after.dayOfYear() === 1 && range.before.dayOfYear() === 1) {
      if (deltaYears === 1) {
        return {
          label: `${range.after.year()}`,
          previous: {
            before: range.before.subtract(1, 'year'),
            after: range.after.subtract(1, 'year'),
            step: ms('1 month')
          },
          next: {
            before: range.before.add(1, 'year'),
            after: range.after.add(1, 'year'),
            step: ms('1 month')
          }
        }
      }
      return {
        label: `${range.after.year()} - ${range.before.year() - 1}`,
        previous: {
          before: range.before.subtract(deltaYears, 'year'),
          after: range.after.subtract(deltaYears, 'year'),
          step: ms('1 month')
        },
        next: {
          before: range.before.add(deltaYears, 'year'),
          after: range.after.add(deltaYears, 'year'),
          step: ms('1 month')
        }
      }
    }
  }

  const deltaMonths = range.before.diff(range.after, 'month')
  if (deltaMonths > 0) {
    if (range.after.date() === 1 && range.before.date() === 1) {
      if (deltaMonths === 1) {
        return {
          label: `${range.after.format('MMMM YYYY')}`,
          previous: {
            before: range.before.subtract(1, 'month'),
            after: range.after.subtract(1, 'month'),
            step: ms('1 day')
          },
          next: {
            before: range.before.add(1, 'month'),
            after: range.after.add(1, 'month'),
            step: ms('1 day')
          }
        }
      }
      return {
        label: range.after.isSame(range.before, 'year')
          ? `${range.after.format('MMMM')} - ${range.before
              .subtract(1, 'day')
              .format('MMMM')} ${range.after.year()}`
          : `${range.after.format('MMMM YYYY')} - ${range.before
              .subtract(1, 'day')
              .format('MMMM YYYY')}`,
        previous: {
          before: range.before.subtract(deltaMonths, 'month'),
          after: range.after.subtract(deltaMonths, 'month'),
          step: ms('1 day')
        },
        next: {
          before: range.before.add(deltaMonths, 'month'),
          after: range.after.add(deltaMonths, 'month'),
          step: ms('1 day')
        }
      }
    }
  }

  const deltaDays = range.before.diff(range.after, 'day')
  if (deltaDays === 1 && startsAtMidnight) {
    return {
      label: range.after.format('LL'),
      previous: {
        before: range.before.subtract(1, 'day'),
        after: range.after.subtract(1, 'day'),
        step: ms('1 hour')
      },
      next: {
        before: range.before.add(1, 'day'),
        after: range.after.add(1, 'day'),
        step: ms('1 hour')
      }
    }
  }
  if (deltaDays > 0 && startsAtMidnight) {
    return {
      label: `${range.after.format('LL')} - ${range.before
        .subtract(1, 'ms')
        .format('LL')}`,
      previous: {
        before: range.before.subtract(deltaDays, 'day'),
        after: range.after.subtract(deltaDays, 'day'),
        step: deltaDays >= 3 ? ms('1 day') : ms('1 hour')
      },
      next: {
        before: range.before.add(deltaDays, 'day'),
        after: range.after.add(deltaDays, 'day'),
        step: deltaDays >= 3 ? ms('1 day') : ms('1 hour')
      }
    }
  }
  return {
    label: 'Implement me',
    previous: {
      step: ms('15 min')
    },
    next: {
      step: ms('15 min')
    }
  }
}
