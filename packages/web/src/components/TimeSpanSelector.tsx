import React from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { SelectProps, Select } from '@chakra-ui/core'

export interface TimeSpanOption {
  id: string
  label: string
  getRange: (ref?: Dayjs) => { before: Dayjs; after: Dayjs }
}

export interface TimeSpanSelectorProps extends Omit<SelectProps, 'onChange'> {
  onChange?: (option: TimeSpanOption) => void
}

const options: TimeSpanOption[] = [
  {
    id: 'all-time',
    label: 'All time',
    getRange: (ref = dayjs()) => ({
      before: ref.add(1, 'day'),
      after: ref.subtract(999, 'year')
    })
  },
  // Relative
  {
    id: 'last-30-days',
    label: 'Last 30 days',
    getRange: (ref = dayjs()) => ({
      before: ref,
      after: ref.subtract(30, 'day')
    })
  },
  {
    id: 'last-7-days',
    label: 'Last 7 days',
    getRange: (ref = dayjs()) => ({
      before: ref,
      after: ref.subtract(7, 'day')
    })
  },
  // Fixed reporting
  {
    id: 'last-month',
    label: 'Last month',
    getRange: (ref = dayjs()) => {
      const startOfThisMonth = ref.startOf('month')
      return {
        before: startOfThisMonth,
        after: startOfThisMonth.subtract(1, 'month')
      }
    }
  },
  {
    id: 'last-week',
    label: 'Last week',
    getRange: (ref = dayjs()) => {
      const startOfThisWeek = ref.startOf('week')
      return {
        before: startOfThisWeek,
        after: startOfThisWeek.subtract(1, 'week')
      }
    }
  }
]

const TimeSpanSelector: React.FC<TimeSpanSelectorProps> = ({
  onChange,
  ...props
}) => {
  const [currentID, setCurrentID] = React.useState('all-time')

  React.useEffect(() => {
    const opt = options.find(opt => opt.id === currentID)
    if (!opt || !onChange) {
      return
    }
    onChange(opt)
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

export default TimeSpanSelector
