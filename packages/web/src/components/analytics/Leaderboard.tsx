import React from 'react'
import { Text, Progress, Flex } from '@chakra-ui/core'
import { LeaderboardEntry } from '@chiffre/analytics-processing'
import theme from '../../ui/theme'

export interface LeadeboardProps {
  entries: Readonly<LeaderboardEntry[]>
  limit?: number
  flexRatio?: number
  formatScore?: (score: number) => string
}

const Leaderboard: React.FC<LeadeboardProps> = ({
  entries,
  limit = 10,
  flexRatio = 4,
  formatScore = score => score.toFixed()
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

  if (data.length === 0) {
    return (
      <Text textAlign="center" my={4} fontSize="sm" color="gray.600">
        No data
      </Text>
    )
  }
  return (
    <>
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
            fontFamily={index === limit ? theme.fonts.body : theme.fonts.mono}
            fontSize="sm"
            color="gray.800"
          >
            {entry.key}
          </Text>
        </Flex>
      ))}
    </>
  )
}

export default Leaderboard
