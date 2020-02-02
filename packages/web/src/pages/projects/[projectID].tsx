import React from 'react'
import { NextPage } from 'next'
import { useChiffreClient } from '../../hooks/useChiffreClient'
import useQueryString from '../../hooks/useQueryString'
import MainPage from '../../layouts/MainPage'
import Header from '../../components/Header'
import { MessageQueueResponse } from '@chiffre/api-types'
import { Box } from '@chakra-ui/core'
import { ResponsiveLine } from '@nivo/line'

const fooStream = {
  id: 'foo',
  // color: 'hsl(273, 70%, 50%)',
  data: [
    { x: '2020-01-01', y: 30 },
    { x: '2020-01-05', y: 22 },
    { x: '2020-01-06', y: 58 },
    { x: '2020-01-07', y: 63 },
    { x: '2020-01-08', y: 29 },
    { x: '2020-01-09', y: 41 },
    { x: '2020-01-10', y: 45 },
    { x: '2020-01-11', y: 6 },
    { x: '2020-01-11', y: 93 },
    { x: '2020-01-12', y: 16 },
    { x: '2020-01-13', y: 7 },
    { x: '2020-01-13', y: 44 },
    { x: '2020-01-14', y: 8 },
    { x: '2020-01-15', y: 96 },
    { x: '2020-01-15', y: 91 },
    { x: '2020-01-16', y: 48 },
    { x: '2020-01-17', y: 26 },
    { x: '2020-01-17', y: 36 },
    { x: '2020-01-18', y: 45 },
    { x: '2020-01-18', y: 42 },
    { x: '2020-01-19', y: 87 },
    { x: '2020-01-20', y: 32 },
    { x: '2020-01-21', y: 14 },
    { x: '2020-01-21', y: 93 },
    { x: '2020-01-22', y: 10 },
    { x: '2020-01-24', y: 82 },
    { x: '2020-01-24', y: 80 },
    { x: '2020-01-25', y: 46 },
    { x: '2020-01-26', y: 19 },
    { x: '2020-01-26', y: 78 },
    { x: '2020-01-27', y: 20 },
    { x: '2020-01-28', y: 34 },
    { x: '2020-01-28', y: 74 },
    { x: '2020-01-29', y: 17 },
    { x: '2020-01-30', y: 73 },
    { x: '2020-01-30', y: 85 },
    { x: '2020-01-31', y: 34 },
    { x: '2020-01-31', y: 24 },
    { x: '2020-02-01', y: 76 },
    { x: '2020-02-01', y: 40 },
    { x: '2020-02-02', y: 80 },
    { x: '2020-02-02', y: 50 },
    { x: '2020-02-03', y: 19 },
    { x: '2020-02-03', y: 83 },
    { x: '2020-02-04', y: 86 },
    { x: '2020-02-05', y: 84 },
    { x: '2020-02-06', y: 18 },
    { x: '2020-02-06', y: 27 },
    { x: '2020-02-07', y: 32 },
    { x: '2020-02-08', y: 53 },
    { x: '2020-02-09', y: 86 },
    { x: '2020-02-09', y: 6 },
    { x: '2020-02-10', y: 85 },
    { x: '2020-02-10', y: 50 },
    { x: '2020-02-11', y: 35 },
    { x: '2020-02-12', y: 3 },
    { x: '2020-02-12', y: 30 },
    { x: '2020-02-13', y: 21 },
    { x: '2020-02-14', y: 96 },
    { x: '2020-02-14', y: 15 },
    { x: '2020-02-15', y: 92 },
    { x: '2020-02-16', y: 68 },
    { x: '2020-02-16', y: 12 },
    { x: '2020-02-17', y: 87 },
    { x: '2020-02-18', y: 32 },
    { x: '2020-02-18', y: 27 },
    { x: '2020-02-19', y: 69 },
    { x: '2020-02-20', y: 54 },
    { x: '2020-02-21', y: 50 },
    { x: '2020-02-21', y: 41 },
    { x: '2020-02-22', y: 14 },
    { x: '2020-02-23', y: 12 },
    { x: '2020-02-23', y: 80 },
    { x: '2020-02-24', y: 52 },
    { x: '2020-02-25', y: 66 },
    { x: '2020-02-25', y: 38 },
    { x: '2020-02-26', y: 26 },
    { x: '2020-02-27', y: 89 },
    { x: '2020-02-27', y: 42 },
    { x: '2020-02-28', y: 22 },
    { x: '2020-02-29', y: 81 },
    { x: '2020-02-29', y: 89 },
    { x: '2020-03-01', y: 80 },
    { x: '2020-03-01', y: 70 },
    { x: '2020-03-02', y: 19 },
    { x: '2020-03-03', y: 25 },
    { x: '2020-03-03', y: 75 },
    { x: '2020-03-04', y: 38 },
    { x: '2020-03-05', y: 35 },
    { x: '2020-03-05', y: 73 },
    { x: '2020-03-06', y: 70 },
    { x: '2020-03-07', y: 50 },
    { x: '2020-03-07', y: 98 },
    { x: '2020-03-08', y: 10 },
    { x: '2020-03-09', y: 13 },
    { x: '2020-03-09', y: 32 },
    { x: '2020-03-10', y: 72 },
    { x: '2020-03-11', y: 81 },
    { x: '2020-03-12', y: 37 }
  ]
}

const ProjectPage: NextPage = ({}) => {
  // const projectID = useQueryString('projectID')
  // const client = useChiffreClient()
  // const project = client.getProject(projectID)

  // const [messages, setMessages] = React.useState<MessageQueueResponse[]>([])

  // React.useEffect(() => {
  //   if (!project) {
  //     return
  //   }
  //   client
  //     .getProjectMessages(projectID)
  //     .then(setMessages)
  //     .catch(console.error)
  // }, [project])

  // const decryptedMessages = React.useMemo(() => {
  //   return messages.map(msg => ({
  //     ...msg,
  //     message: JSON.parse(project.decryptMessage(msg.message))
  //   }))
  // }, [messages])

  // const fooStream = React.useMemo(() => {
  //   return {
  //     id: 'foo',
  //     color: 'hsl(273, 70%, 50%)',
  //     data: decryptedMessages
  //       .filter(
  //         ({ message }) =>
  //           message.type === 'generic:number' && message.data?.name === 'foo'
  //       )
  //       .map(({ message }) => ({
  //         x: new Date(message.time).toISOString(),
  //         y: message.data.value
  //       }))
  //   }
  // }, [decryptedMessages])

  return (
    <MainPage>
      <Header />
      <Box as="pre" fontSize="xs">
        {/* {JSON.stringify(project, null, 2)} */}
      </Box>
      <ResponsiveLine
        curve="monotoneX"
        data={[fooStream]}
        // ----------------------
        enableSlices="x"
        xScale={{
          type: 'time',
          format: '%Y-%m-%d',
          precision: 'day'
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{
          type: 'linear'
          //   stacked: boolean('stacked', false)
        }}
        axisLeft={{
          legend: 'linear scale',
          legendOffset: 12
        }}
        axisBottom={{
          format: '%b %d',
          tickValues: 'every 2 days',
          legend: 'time scale',
          legendOffset: -12
        }}
        enablePointLabel={true}
        // pointSize={16}
        pointBorderWidth={1}
        pointBorderColor={{
          from: 'color',
          modifiers: [['darker', 0.3]]
        }}
        useMesh={true}
      />
    </MainPage>
  )
}

export default ProjectPage
