import React from 'react'
import { Text, Progress, Flex, Stack, Box } from '@chakra-ui/core'
import { LeaderboardEntry } from '@chiffre/analytics-processing'
import theme from '../../ui/theme'
import { ResponsivePie, PieDatum } from '@nivo/pie'

export interface LeadeboardProps {
  entries: Readonly<LeaderboardEntry[]>
  limit?: number
  flexRatio?: number
  formatScore?: (score: number) => string
  fontFamily?: 'mono' | 'body'
  showPie?: boolean
  pieData?: PieDatum[]
}

const Leaderboard: React.FC<LeadeboardProps> = ({
  entries,
  limit = 10,
  flexRatio = 4,
  formatScore = score => score.toFixed(),
  fontFamily = 'body',
  showPie = false,
  pieData
}) => {
  const [showPercent, setShowPercent] = React.useState(false)

  const data = React.useMemo(() => {
    if (!limit || limit >= entries.length) {
      return entries
    }
    const omittedLength = entries.length - limit
    const key = `${omittedLength} other${omittedLength > 1 ? 's' : ''}`
    return [
      ...entries.slice(0, limit),
      entries.slice(limit).reduce(
        (acc, entry) => ({
          key,
          percent: acc.percent + entry.percent,
          score: acc.score + entry.score
        }),
        {
          key,
          percent: 0,
          score: 0
        }
      )
    ]
  }, [entries, limit])

  const scoreScale = React.useMemo(() => {
    const max = data.reduce((max, entry) => Math.max(max, entry.score), 0)
    return 75 / max
  }, [data])

  const _pieData = React.useMemo(() => {
    if (!showPercent) {
      return (
        pieData ||
        data.map(entry => ({
          id: entry.key,
          label: entry.key,
          value: entry.score
        }))
      ).sort((a, b) => a.value - b.value)
    }
    if (pieData) {
      const sum = pieData.reduce((sum, d) => sum + d.value, 0)
      console.dir({ sum })
      return pieData
        .map(d => ({
          ...d,
          value: (100 * d.value) / sum
        }))
        .sort((a, b) => a.value - b.value)
    }
    return data
      .map(entry => ({
        id: entry.key,
        label: entry.key,
        value: entry.percent
      }))
      .sort((a, b) => a.value - b.value)
  }, [pieData, data, showPercent])

  if (data.length === 0) {
    return (
      <Text textAlign="center" my={4} fontSize="sm" color="gray.600">
        No data
      </Text>
    )
  }

  return (
    <Flex>
      <Box flex={1}>
        {data.map((entry, index) => (
          <Flex key={entry.key} alignItems="center">
            <Flex
              position="relative"
              flex={1}
              h={4}
              mr={2}
              alignItems="center"
              justifyContent="flex-end"
              cursor="pointer"
              onClick={() => setShowPercent(state => !state)}
            >
              <Progress
                position="absolute"
                borderRadius={2}
                w="100%"
                h="100%"
                value={showPercent ? entry.percent : entry.score * scoreScale}
                opacity={0.2}
              />
              <Text fontSize="sm" pr={1}>
                {showPercent
                  ? `${entry.percent.toFixed()} %`
                  : `${formatScore(entry.score)}`}
              </Text>
            </Flex>
            <Text
              flex={flexRatio}
              fontFamily={
                index !== limit && fontFamily === 'mono'
                  ? theme.fonts.mono
                  : theme.fonts.body
              }
              fontSize={
                index !== limit && fontFamily === 'mono' ? ['xs', 'sm'] : 'sm'
              }
              color="gray.800"
            >
              {entry.key}
            </Text>
          </Flex>
        ))}
      </Box>
      {showPie && data.length > 5 && (
        <Box flex={1} display={['none', 'none', 'block']}>
          <ResponsivePie
            colors={[
              theme.colors.blue['300'],
              theme.colors.cyan['300'],
              theme.colors.teal['300'],
              theme.colors.green['300'],
              theme.colors.indigo['300'],
              theme.colors.purple['300'],
              theme.colors.pink['300'],
              theme.colors.red['300'],
              theme.colors.orange['300'],
              theme.colors.yellow['300']
            ]}
            padAngle={0.75}
            cornerRadius={2}
            innerRadius={0.5}
            radialLabelsSkipAngle={20}
            slicesLabelsSkipAngle={20}
            radialLabelsLinkOffset={0}
            radialLabelsLinkDiagonalLength={0}
            radialLabelsLinkHorizontalLength={12}
            radialLabelsTextColor={theme.colors.gray['700']}
            radialLabelsLinkColor={theme.colors.gray['400']}
            margin={{
              top: 10,
              bottom: 10,
              left: 30,
              right: 30
            }}
            sortByValue
            data={_pieData}
            sliceLabel={d =>
              showPercent ? `${d.value.toFixed()}%` : `${d.value}`
            }
          />
        </Box>
      )}
    </Flex>
  )
}

export default Leaderboard
