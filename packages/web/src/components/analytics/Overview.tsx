import React from 'react'
import {
  BoxProps,
  Text,
  Stack,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  Icon,
  Button,
  StatHelpText,
  StatArrow,
  DarkMode
} from '@chakra-ui/core'
import styled from '@emotion/styled'
import prettyMs from 'pretty-ms'
import useTimeRange, { TimeRange } from '../../hooks/useTimeRange'
import { Analytics } from './useAnalytics'

const HideableButton = styled(Button)<{ visible: boolean }>`
  visibility: ${p => (p.visible ? 'visible' : 'hidden')};
`

export interface OverviewProps extends BoxProps {
  timeRange: TimeRange
  updateTimeRange?: (newRange: TimeRange) => void
  currentAnalytics: Analytics
  previousAnalytics?: Analytics
}

interface IncrDecrIndicatorProps {
  previous?: number
  current: number
}

const IncrDecrIndicator: React.FC<IncrDecrIndicatorProps> = ({
  previous,
  current
}) => {
  if (previous === null || previous === undefined) {
    return null
  }
  if (previous === current) {
    return null
  }
  const delta = current - previous
  const deltaStr = `${delta > 0 ? '+' : ''}${delta.toFixed()}`
  const deltaPct = `${delta > 0 ? '+' : ''}${(
    (100 * (current - previous)) /
    current
  ).toFixed()}`

  return (
    <StatHelpText color="gray.500">
      <StatArrow
        type={delta > 0 ? 'increase' : 'decrease'}
        color={delta > 0 ? 'green.400' : 'red.500'}
      />{' '}
      {deltaStr} ({deltaPct}%)
    </StatHelpText>
  )
}

const Overview: React.FC<OverviewProps> = ({
  timeRange,
  updateTimeRange = () => {},
  currentAnalytics,
  previousAnalytics,
  ...props
}) => {
  const {
    label: timeRangeLabel,
    next: nextTimeRange,
    previous: previousTimeRange
  } = useTimeRange(timeRange)

  return (
    <Stack {...props}>
      <Flex alignItems="center">
        <HideableButton
          visible={!!previousTimeRange}
          onClick={() => updateTimeRange(previousTimeRange)}
          variant="ghost"
          p={0}
          color="gray.500"
          _hover={{
            color: 'gray.100',
            bg: 'gray.700'
          }}
          _active={{
            bg: 'gray.600'
          }}
        >
          <Icon name="chevron-left" w={6} h={6} />
        </HideableButton>
        <Text mx="auto" fontSize="sm">
          {timeRangeLabel}
        </Text>
        <HideableButton
          visible={!!nextTimeRange}
          onClick={() => updateTimeRange(nextTimeRange)}
          variant="ghost"
          p={0}
          color="gray.500"
          _hover={{
            color: 'gray.100',
            bg: 'gray.700'
          }}
        >
          <Icon name="chevron-right" w={6} h={6} />
        </HideableButton>
      </Flex>

      <StatGroup px={4} alignItems="flex-start" textAlign="center">
        <Stat>
          <StatLabel color="gray.500" textTransform="uppercase" fontSize="xs">
            Visits
          </StatLabel>
          <StatNumber fontSize="4xl">{currentAnalytics.visits}</StatNumber>
          <IncrDecrIndicator
            current={currentAnalytics.visits}
            previous={previousAnalytics?.visits}
          />
        </Stat>
        <Stat>
          <StatLabel color="gray.500" textTransform="uppercase" fontSize="xs">
            Page views
          </StatLabel>
          <StatNumber fontSize="4xl">{currentAnalytics.pageViews}</StatNumber>
          <IncrDecrIndicator
            current={currentAnalytics.pageViews}
            previous={previousAnalytics?.pageViews}
          />
        </Stat>
        <Stat>
          <StatLabel color="gray.500" textTransform="uppercase" fontSize="xs">
            Time on Site
          </StatLabel>
          <StatNumber>
            {prettyMs(currentAnalytics.timeOnSite.avg, { compact: true })}
          </StatNumber>
        </Stat>
        <Stat display={['none', 'block']}>
          <StatLabel color="gray.500" textTransform="uppercase" fontSize="xs">
            Events
          </StatLabel>
          <StatNumber>{currentAnalytics.data.length}</StatNumber>
        </Stat>
      </StatGroup>
    </Stack>
  )
}

export default Overview
