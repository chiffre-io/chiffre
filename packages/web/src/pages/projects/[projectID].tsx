import React from 'react'
import { NextPage } from 'next'
import { Flex, Stack, Icon, Heading } from '@chakra-ui/core'
import prettyMs from 'pretty-ms'
import { useProject } from '../../hooks/useChiffreClient'
import useQueryString from '../../hooks/useQueryString'
import MainPage from '../../layouts/MainPage'
import useLoadProjectMessages from '../../engine/chiffre'
import TimeRangeSelector from '../../components/analytics/TimeRangeSelector'
import { Container, StackContainer } from '../../layouts/Container'
import { Card } from '../../components/Card'
import Leaderboard from '../../components/analytics/Leaderboard'
import Overview from '../../components/analytics/Overview'
import useTimeRange, { TimeRange } from '../../hooks/useTimeRange'
import useAnalytics from '../../components/analytics/useAnalytics'

const ProjectPage: NextPage = ({}) => {
  const projectID = useQueryString('projectID')
  const project = useProject(projectID)
  useLoadProjectMessages(projectID)

  const [timeRange, setTimeRange] = React.useState<TimeRange>({})
  // const { previous: previousTimeRange } = useTimeRange(timeRange)

  const currentAnalytics = useAnalytics(projectID, timeRange)
  const previousAnalytics = undefined // useAnalytics(projectID, previousTimeRange)

  return (
    <MainPage>
      <Flex px={4} my={4}>
        {project && (
          <Heading as="h2" fontSize="lg" fontWeight="medium">
            {project.name}
          </Heading>
        )}
        <Stack isInline alignItems="center" ml="auto">
          <Icon name="repeat-clock" />
          <TimeRangeSelector onChange={setTimeRange} size="sm" w="auto" />
        </Stack>
      </Flex>
      <Container as="section" wide>
        <Card shadow="sm" bg="gray.800" color="gray.300">
          <Overview
            timeRange={timeRange}
            updateTimeRange={setTimeRange}
            currentAnalytics={currentAnalytics}
            previousAnalytics={previousAnalytics}
          />
        </Card>
      </Container>
      <StackContainer as="section" spacing={8} my={2} wide>
        <Card>
          <Heading fontSize="lg" fontWeight="semibold" mb={4}>
            Page views
          </Heading>
          <Leaderboard entries={currentAnalytics.pageCount} />
        </Card>
        <Card>
          <Heading fontSize="lg" fontWeight="semibold" mb={4}>
            Time on page
          </Heading>
          <Leaderboard
            entries={currentAnalytics.timeOnPage}
            formatScore={score => prettyMs(score, { unitCount: 2 })}
          />
        </Card>
      </StackContainer>
    </MainPage>
  )
}

export default ProjectPage
