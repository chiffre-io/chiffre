import React from 'react'
import { NextPage } from 'next'
import ActivityEvent from '../components/ActivityEvent'
import { Stack, Heading, Box, Link } from '@chakra-ui/core'
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
        my={[4, 8]}
        as="main"
        p={4}
        bg="white"
        borderRadius="3px"
        boxShadow="sm"
      >
        <Heading as="h3" fontSize="xl" mb={4} fontWeight="semibold">
          Account Activity
        </Heading>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
          placerat risus quis diam porttitor placerat. In risus turpis, viverra
          eget semper et, volutpat nec augue. Donec a leo tellus. Mauris
          ullamcorper orci lacus. Sed sodales elementum odio quis dignissim.
          Nullam porta ornare nisl vitae rhoncus. Curabitur nec dignissim ante.
          Vestibulum fringilla urna at hendrerit tincidunt. Quisque elit purus,
          ultricies vel ligula eu, congue rutrum purus. Suspendisse varius
          finibus neque, et luctus arcu consequat id. Nam vitae fringilla velit.
          Mauris vitae odio feugiat, eleifend mauris sit amet, porttitor elit.
          Proin placerat turpis nec eros venenatis viverra. Morbi quis odio
          viverra, ullamcorper eros a, iaculis leo. Morbi varius lacus a tellus
          vulputate pharetra. Vestibulum facilisis tortor sit amet leo consequat
          eleifend. Mauris auctor ultricies lacus, in tincidunt ipsum dapibus
          et. Maecenas lacinia vel eros nec malesuada. In ullamcorper vel est
          vel vestibulum. Proin pellentesque, nisi eget rutrum imperdiet, leo
          dolor vestibulum nisl, id maximus nisl augue sit amet urna.
          Suspendisse rhoncus tellus quam, vestibulum tempus libero mollis sit
          amet. Praesent vestibulum, mi vitae lobortis malesuada, erat metus
          feugiat enim, sed facilisis sem libero quis eros. Nunc venenatis
          lobortis nisl, id tempus dui maximus in. Donec euismod, dui eu maximus
          sollicitudin, nibh elit tempus eros, sit amet imperdiet turpis nisl at
          magna. Mauris lacinia ante in cursus blandit. Fusce est lectus,
          elementum non tempor consectetur, tempor a enim. Integer eu dui eu
          sapien finibus gravida vel ut quam. Ut dapibus tortor turpis, sit amet
          eleifend elit accumsan id. Maecenas non imperdiet tortor, nec eleifend
          est. Phasellus placerat feugiat felis ut feugiat. Vivamus tempor risus
          eget laoreet facilisis. Phasellus mattis sagittis scelerisque.
          Maecenas eleifend et erat non tincidunt. Nulla ac nunc massa. Donec
          tincidunt dolor id augue finibus viverra. Donec blandit dapibus enim
          et fringilla. Sed efficitur posuere ante, nec tincidunt lectus
          malesuada at. Nulla mollis felis nec varius egestas. Fusce ultricies
          nunc diam, a vulputate quam porttitor vel. Pellentesque viverra
          fringilla libero eu pulvinar. Mauris pharetra risus a metus dapibus,
          ut hendrerit enim tempus. Aliquam erat volutpat. Suspendisse elementum
          ex at augue sodales, eu efficitur nunc malesuada. Phasellus
          condimentum luctus nisi vel feugiat. Maecenas mollis enim orci, ac
          posuere velit vehicula quis. Ut sit amet fermentum augue. Integer
          ullamcorper enim urna, eu fringilla enim consectetur sollicitudin.
          Etiam interdum velit in arcu blandit, et fringilla sapien luctus.
          Phasellus id magna turpis.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
          placerat risus quis diam porttitor placerat. In risus turpis, viverra
          eget semper et, volutpat nec augue. Donec a leo tellus. Mauris
          ullamcorper orci lacus. Sed sodales elementum odio quis dignissim.
          Nullam porta ornare nisl vitae rhoncus. Curabitur nec dignissim ante.
          Vestibulum fringilla urna at hendrerit tincidunt. Quisque elit purus,
          ultricies vel ligula eu, congue rutrum purus. Suspendisse varius
          finibus neque, et luctus arcu consequat id. Nam vitae fringilla velit.
          Mauris vitae odio feugiat, eleifend mauris sit amet, porttitor elit.
          Proin placerat turpis nec eros venenatis viverra. Morbi quis odio
          viverra, ullamcorper eros a, iaculis leo. Morbi varius lacus a tellus
          vulputate pharetra. Vestibulum facilisis tortor sit amet leo consequat
          eleifend. Mauris auctor ultricies lacus, in tincidunt ipsum dapibus
          et. Maecenas lacinia vel eros nec malesuada. In ullamcorper vel est
          vel vestibulum. Proin pellentesque, nisi eget rutrum imperdiet, leo
          dolor vestibulum nisl, id maximus nisl augue sit amet urna.
          Suspendisse rhoncus tellus quam, vestibulum tempus libero mollis sit
          amet. Praesent vestibulum, mi vitae lobortis malesuada, erat metus
          feugiat enim, sed facilisis sem libero quis eros. Nunc venenatis
          lobortis nisl, id tempus dui maximus in. Donec euismod, dui eu maximus
          sollicitudin, nibh elit tempus eros, sit amet imperdiet turpis nisl at
          magna. Mauris lacinia ante in cursus blandit. Fusce est lectus,
          elementum non tempor consectetur, tempor a enim. Integer eu dui eu
          sapien finibus gravida vel ut quam. Ut dapibus tortor turpis, sit amet
          eleifend elit accumsan id. Maecenas non imperdiet tortor, nec eleifend
          est. Phasellus placerat feugiat felis ut feugiat. Vivamus tempor risus
          eget laoreet facilisis. Phasellus mattis sagittis scelerisque.
          Maecenas eleifend et erat non tincidunt. Nulla ac nunc massa. Donec
          tincidunt dolor id augue finibus viverra. Donec blandit dapibus enim
          et fringilla. Sed efficitur posuere ante, nec tincidunt lectus
          malesuada at. Nulla mollis felis nec varius egestas. Fusce ultricies
          nunc diam, a vulputate quam porttitor vel. Pellentesque viverra
          fringilla libero eu pulvinar. Mauris pharetra risus a metus dapibus,
          ut hendrerit enim tempus. Aliquam erat volutpat. Suspendisse elementum
          ex at augue sodales, eu efficitur nunc malesuada. Phasellus
          condimentum luctus nisi vel feugiat. Maecenas mollis enim orci, ac
          posuere velit vehicula quis. Ut sit amet fermentum augue. Integer
          ullamcorper enim urna, eu fringilla enim consectetur sollicitudin.
          Etiam interdum velit in arcu blandit, et fringilla sapien luctus.
          Phasellus id magna turpis.
        </p>
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
