import React from 'react'
import { NextPage } from 'next'
import ActivityEvent from '../components/ActivityEvent'
import { Stack, Heading, Box } from '@chakra-ui/core'
import Header from '../components/Header'
import { useChiffreClient } from '../hooks/useChiffreClient'
import MainPage from '../layouts/MainPage'

const ActivityPage: NextPage = () => {
  const client = useChiffreClient()
  const [activity, setActivity] = React.useState([])

  React.useEffect(() => {
    if (!client.getAccountActivity) {
      return
    }
    client
      .getAccountActivity()
      .then(setActivity)
      .catch(console.error)
  }, [client])

  return (
    <MainPage>
      <Header />
      <Box
        maxW="xl"
        mx="auto"
        mt={[4, 8]}
        as="main"
        p={4}
        bg="white"
        borderRadius="3px"
        boxShadow="sm"
      >
        <Heading as="h3" fontSize="xl" mb={4} fontWeight="semibold">
          Account Activity
        </Heading>
        <Stack spacing={2}>
          {activity.map(event => (
            <ActivityEvent
              key={event.eventID}
              {...event}
              date={new Date(event.date)}
            />
          ))}
        </Stack>
      </Box>
    </MainPage>
  )
}

export default ActivityPage
