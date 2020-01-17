import React from 'react'
import { ActivityResponse } from '@chiffre/api-types'
import { Box, Text, Stack, Link } from '@chakra-ui/core'
import { format } from 'timeago.js'

const ActivityEvent: React.FC<ActivityResponse> = ({
  message,
  ip,
  date,
  meta,
  ...props
}) => {
  return (
    <Box
      {...props}
      borderBottomWidth="1px"
      borderBottomColor="gray.200"
      paddingBottom={2}
      px={2}
    >
      <Stack align="baseline" spacing={2} isInline>
        <Text fontSize={['sm', 'md']} color="gray.700">
          {message}
        </Text>
        <Text fontSize={['sm', 'md']} color="gray.600" ml="auto">
          {format(date)}
        </Text>
      </Stack>
      <Stack align="baseline" spacing={2} isInline>
        <Link fontSize={['sm', 'md']} color="blue.700">
          {meta?.projectID}
        </Link>
        <Box
          as="pre"
          fontSize={['xs', 'sm']}
          color="gray.500"
          ml="auto"
          fontWeight={['medium', 'normal']}
        >
          {ip}
        </Box>
      </Stack>
    </Box>
  )
}

export default ActivityEvent
