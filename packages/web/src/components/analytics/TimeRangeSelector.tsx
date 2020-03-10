import React from 'react'
import ms from 'ms'
import dayjs, { Dayjs } from 'dayjs'
import { SelectProps, Select } from '@chakra-ui/core'
import { TimeRange } from '../../hooks/useTimeRange'

export interface TimeRangeOption {
  id: string
  label: string
  getRange: (ref?: Dayjs) => TimeRange
}

export interface TimeRangeSelectorProps extends Omit<SelectProps, 'onChange'> {
  onChange?: (range: TimeRange) => void
}

const options: TimeRangeOption[] = [
  {
    id: 'all-time',
    label: 'All time',
    getRange: () => ({
      step: ms('1 day')
    })
  },
  // Relative
  {
    id: 'last-30-days',
    label: 'Last 30 days',
    getRange: (ref = dayjs()) => ({
      before: ref,
      after: ref.subtract(30, 'day'),
      step: ms('1 day')
    })
  },
  {
    id: 'last-7-days',
    label: 'Last 7 days',
    getRange: (ref = dayjs()) => ({
      before: ref,
      after: ref.subtract(7, 'day'),
      step: ms('1 day')
    })
  },
  // Fixed reporting
  {
    id: 'last-week',
    label: 'Last week',
    getRange: (ref = dayjs()) => {
      const startOfThisWeek = ref.startOf('week')
      return {
        before: startOfThisWeek,
        after: startOfThisWeek.subtract(1, 'week'),
        step: ms('1 day')
      }
    }
  },
  {
    id: 'last-month',
    label: 'Last month',
    getRange: (ref = dayjs()) => {
      const startOfThisMonth = ref.startOf('month')
      return {
        before: startOfThisMonth,
        after: startOfThisMonth.subtract(1, 'month'),
        step: ms('1 day')
      }
    }
  },
  {
    id: 'last-year',
    label: 'Last year',
    getRange: (ref = dayjs()) => {
      const startOfThisYear = ref.startOf('year')
      return {
        before: startOfThisYear,
        after: startOfThisYear.subtract(1, 'year'),
        step: ms('1 month')
      }
    }
  },
  {
    id: 'this-day',
    label: 'Today so far',
    getRange: (ref = dayjs()) => {
      const startOfThisDay = ref.startOf('day')
      return {
        before: startOfThisDay.add(1, 'day'),
        after: startOfThisDay,
        step: ms('1 hour')
      }
    }
  },
  {
    id: 'this-week',
    label: 'This week so far',
    getRange: (ref = dayjs()) => {
      const startOfThisWeek = ref.startOf('week')
      return {
        before: startOfThisWeek.add(1, 'week'),
        after: startOfThisWeek,
        step: ms('1 day')
      }
    }
  },
  {
    id: 'this-month',
    label: 'This month so far',
    getRange: (ref = dayjs()) => {
      const startOfThisMonth = ref.startOf('month')
      return {
        before: startOfThisMonth.add(1, 'month'),
        after: startOfThisMonth,
        step: ms('1 day')
      }
    }
  },
  {
    id: 'this-year',
    label: 'This year so far',
    getRange: (ref = dayjs()) => {
      const startOfThisYear = ref.startOf('year')
      return {
        before: startOfThisYear.add(1, 'year'),
        after: startOfThisYear,
        step: ms('1 month')
      }
    }
  }
]

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  onChange,
  ...props
}) => {
  const [currentID, setCurrentID] = React.useState('all-time')

  React.useEffect(() => {
    const opt = options.find(opt => opt.id === currentID)
    if (!opt || !onChange) {
      return
    }
    onChange(opt.getRange())
  }, [currentID, onChange])

  return (
    <Select
      {...props}
      value={currentID}
      onChange={e => setCurrentID(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </Select>
  )
}

export default TimeRangeSelector
