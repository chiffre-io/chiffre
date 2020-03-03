import React from 'react'
import { NextPage } from 'next'
import { useChiffreClient, useProject } from '../../hooks/useChiffreClient'
import useQueryString from '../../hooks/useQueryString'
import MainPage from '../../layouts/MainPage'
import {
  Box,
  Flex,
  Stack,
  Icon,
  Text,
  Heading,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/core'
import { ResponsiveLine } from '@nivo/line'
import useLoadProjectMessages, {
  retrieveProjectMessages
} from '../../engine/chiffre'
import TimeSpanSelector, {
  TimeSpanOption
} from '../../components/TimeSpanSelector'
import { useDatabase } from '../../engine/db'
import { AllEvents } from '@chiffre/analytics-core'
import dayjs from 'dayjs'

function useData(projectID: string) {
  const [timeSpanOption, onTimeSpanChange] = React.useState<TimeSpanOption>()
  const db = useDatabase()
  const [data, setData] = React.useState<AllEvents[]>([])
  const [timeSpan, setTimeSpan] = React.useState({
    before: dayjs(),
    after: dayjs()
  })

  React.useEffect(() => {
    if (!timeSpanOption) {
      return
    }
    setTimeSpan(timeSpanOption.getRange())
  }, [timeSpanOption])

  React.useEffect(() => {
    if (!timeSpan || !db) {
      return
    }
    db.events
      .where('time')
      .between(timeSpan.after.valueOf(), timeSpan.before.valueOf(), true, false)
      .and(evt => evt.projectID === projectID)
      .toArray()
      .then(setData)
  }, [timeSpan, db, projectID])

  return {
    data,
    onTimeSpanChange,
    timeSpanText: `${timeSpan.after.format()} - ${timeSpan.before.format()}`
  }
}

const ProjectPage: NextPage = ({}) => {
  const projectID = useQueryString('projectID')
  const project = useProject(projectID)
  useLoadProjectMessages(projectID)

  const { data, onTimeSpanChange, timeSpanText } = useData(projectID)

  const eventTypes = React.useMemo(() => {
    return Array.from(new Set(data.map(evt => evt.type)))
  }, [data])

  return (
    <MainPage>
      <Flex px={4} my={4}>
        {project && (
          <Heading as="h2" fontSize="lg" fontWeight="medium">
            {project.name}
          </Heading>
        )}
        <Stack isInline alignItems="center" ml="auto">
          <Text fontSize="sm" color="gray.600">
            {timeSpanText}
          </Text>
          <Icon name="repeat-clock" />
          <TimeSpanSelector onChange={onTimeSpanChange} size="sm" w="auto" />
        </Stack>
      </Flex>
      <StatGroup maxW="xl" mx="auto">
        <Stat>
          <StatLabel>Visits</StatLabel>
          <StatNumber fontSize="4xl">
            {data.filter(evt => evt.type === 'session:start').length}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Page views</StatLabel>
          <StatNumber fontSize="4xl">
            {
              data.filter(evt =>
                ['session:start', 'page:visit'].includes(evt.type)
              ).length
            }
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Events</StatLabel>
          <StatNumber>{data.length}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Event Types</StatLabel>
          <StatNumber>{eventTypes.length}</StatNumber>
        </Stat>
      </StatGroup>

      <Box as="pre" fontSize="xs">
        {JSON.stringify(data, null, 2)}
      </Box>
    </MainPage>
  )
}

export default ProjectPage
