import React from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import ms from 'ms'
import { Text, Stack, Icon, Heading, Box } from '@chakra-ui/core'
import prettyMs from 'pretty-ms'
import { useProject } from '../../hooks/useChiffreClient'
import useQueryString from '../../hooks/useQueryString'
import MainPage from '../../layouts/MainPage'
import useLoadProjectMessages from '../../engine/chiffre'
import TimeRangeSelector from '../../components/analytics/TimeRangeSelector'
import {
  Container,
  StackContainer,
  FlexContainer
} from '../../layouts/Container'
import { Card } from '../../components/Card'
import Leaderboard from '../../components/analytics/Leaderboard'
import Overview from '../../components/analytics/Overview'
import { TimeRange } from '../../hooks/useTimeRange'
import useAnalytics from '../../components/analytics/useAnalytics'
import { ResponsiveBar } from '@nivo/bar'
import { EventRow } from '../../engine/db'
import { Dayjs } from 'dayjs'
import theme from '../../ui/theme'

interface EventsBucket {
  id: string
  count: number
  events: EventRow[]
  startTime: Dayjs
  endTime: Dayjs
}

function useGraphData(events: EventRow[], timeRange: TimeRange) {
  const buckets: EventsBucket[] = []

  if (!timeRange.after && !timeRange.before) {
    return []
  }
  let startTime = timeRange.after
  while (startTime.isBefore(timeRange.before)) {
    const a = startTime
    const b = startTime.add(timeRange.step, 'ms')
    const e = events.filter(
      event => a.isBefore(event.time) && b.isAfter(event.time)
    )
    buckets.push({
      id: `${a.valueOf()}:${b.valueOf()}`,
      count: e.length,
      events: e,
      startTime: a,
      endTime: b
    })
    startTime = b
  }
  return buckets
}

const ProjectPage: NextPage = ({}) => {
  const projectID = useQueryString('projectID')
  const project = useProject(projectID)
  useLoadProjectMessages(projectID)

  const [timeRange, setTimeRange] = React.useState<TimeRange>({
    step: ms('1 day')
  })
  const analytics = useAnalytics(projectID, timeRange)
  const graphData = useGraphData(analytics.data, timeRange)

  return (
    <>
      {project && (
        <Head>
          <title>{project.name} | Chiffre.io</title>
        </Head>
      )}
      <MainPage>
        <FlexContainer mt={8} mb={4} wide>
          {project && (
            <Heading as="h2" fontSize="lg" fontWeight="medium">
              {project.name}
            </Heading>
          )}
          <Stack isInline alignItems="center" ml="auto">
            <Icon name="repeat-clock" />
            <TimeRangeSelector onChange={setTimeRange} size="sm" w="auto" />
          </Stack>
        </FlexContainer>
        <Container as="section" wide>
          <Card
            shadow="none"
            bg="gray.800"
            color="gray.300"
            p={0}
            overflow="hidden"
          >
            <Overview
              timeRange={timeRange}
              updateTimeRange={setTimeRange}
              currentAnalytics={analytics}
              px={4}
              pt={4}
            />
            <Box h="120px">
              <ResponsiveBar
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                enableGridY={false}
                colors={theme.colors.blue['700']}
                labelSkipWidth={32}
                labelTextColor={{
                  from: 'color',
                  modifiers: [['brighter', 2]]
                }}
                theme={{
                  tooltip: {
                    container: {
                      background: theme.colors.gray['900']
                    }
                  }
                }}
                borderRadius={2}
                padding={0.3}
                keys={['count']}
                data={graphData}
              />
            </Box>
          </Card>
        </Container>
        <StackContainer as="section" spacing={4} my={4} wide>
          <Card>
            <Heading fontSize="lg" fontWeight="semibold" mb={4}>
              Page views
            </Heading>
            <Leaderboard entries={analytics.pageCount} fontFamily="mono" />
          </Card>
          <Card>
            <Heading fontSize="lg" fontWeight="semibold" mb={4}>
              Time on page
            </Heading>
            <Leaderboard
              entries={analytics.timeOnPage}
              formatScore={score => prettyMs(score, { unitCount: 2 })}
              fontFamily="mono"
            />
          </Card>
          <Card>
            <Heading fontSize="lg" fontWeight="semibold" mb={4}>
              Referrers
            </Heading>
            <Leaderboard entries={analytics.referrers} showPercentByDefault />
          </Card>
          <Card>
            <Heading fontSize="lg" fontWeight="semibold" mb={4}>
              Countries
            </Heading>
            <Leaderboard
              entries={analytics.countries}
              showPie
              showPercentByDefault
            />
          </Card>
          <Card>
            <Heading fontSize="lg" fontWeight="semibold" mb={4}>
              Browsers
            </Heading>
            <Leaderboard
              entries={analytics.userAgents}
              showPercentByDefault
              showPie
              pieData={analytics.browsers.map(entry => ({
                id: entry.key,
                label: entry.key,
                value: entry.score
              }))}
            />
          </Card>
          <Card>
            <Heading fontSize="lg" fontWeight="semibold" mb={4}>
              Systems
            </Heading>
            <Leaderboard
              entries={analytics.operatingSystemsWithVersion}
              showPercentByDefault
              showPie
              pieData={analytics.operatingSystems.map(entry => ({
                id: entry.key,
                label: entry.key,
                value: entry.score
              }))}
            />
          </Card>
          <Card>
            <Heading fontSize="lg" fontWeight="semibold" mb={4}>
              Screen Widths
            </Heading>
            <Leaderboard
              showPercentByDefault
              showPie
              entries={analytics.viewportWidths.map(({ key, ...entry }) => ({
                key: `${key}px`,
                ...entry
              }))}
              pieData={Array.from(
                analytics.viewportWidths
                  .reduce((entries, entry) => {
                    const buckets = {
                      '< 480px': { min: 0, max: 480 },
                      '480 - 768px': { min: 480, max: 767 },
                      '768 - 992px': { min: 768, max: 992 },
                      '992 - 1280px': { min: 992, max: 1280 },
                      '≥ 1280px': { min: 1280, max: Infinity }
                    }
                    const [key] = Object.entries(buckets).find(
                      ([_, bounds]) =>
                        entry.key >= bounds.min && entry.key < bounds.max
                    )
                    const score = (entries.get(key) || 0) + entry.score
                    entries.set(key, score)
                    return entries
                  }, new Map<string, number>())
                  .entries()
              ).map(([key, score]) => ({
                id: key,
                label: key,
                value: score
              }))}
            />
          </Card>
          <Card>
            <Heading fontSize="lg" fontWeight="semibold" mb={4}>
              Languages
            </Heading>
            <Leaderboard
              entries={analytics.languages}
              showPercentByDefault
              showPie
              pieData={Array.from(
                // Group from first two characters of lang (eg: en-GB & en-US => en)
                analytics.languages
                  .reduce((entries, entry) => {
                    const key = entry.key.slice(0, 2)
                    const score = (entries.get(key) || 0) + entry.score
                    entries.set(key, score)
                    return entries
                  }, new Map())
                  .entries()
              ).map(([key, score]) => ({
                id: key,
                label: key,
                value: score
              }))}
            />
          </Card>
        </StackContainer>
      </MainPage>
    </>
  )
}

export default ProjectPage
