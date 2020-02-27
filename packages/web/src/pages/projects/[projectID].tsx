import React from 'react'
import { NextPage } from 'next'
import { useChiffreClient } from '../../hooks/useChiffreClient'
import useQueryString from '../../hooks/useQueryString'
import MainPage from '../../layouts/MainPage'
import Header from '../../components/Header'
import { MessageQueueResponse } from '@chiffre/api-types'
import { Box } from '@chakra-ui/core'
import { ResponsiveLine } from '@nivo/line'
import { retrieveProjectMessages } from '../../engine/chiffre'

const ProjectPage: NextPage = ({}) => {
  const projectID = useQueryString('projectID')
  const client = useChiffreClient()
  const project = client.getProject(projectID)

  console.dir({
    projectID,
    client,
    project
  })

  React.useEffect(() => {
    if (!client.getProjectMessages) {
      return
    }
    retrieveProjectMessages(client, projectID)
  }, [client.getProjectMessages, projectID])

  return (
    <MainPage>
      <Box as="pre" fontSize="xs">
        {JSON.stringify(project, null, 2)}
      </Box>
      {/* <ResponsiveLine
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
      /> */}
    </MainPage>
  )
}

export default ProjectPage
