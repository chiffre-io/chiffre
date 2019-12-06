import React from 'react'
import { NextPage, NextPageContext } from 'next'
import { authenticatePage, AuthenticatedPage } from '~/src/shared/auth'
import useKeychainKey from '~/src/client/hooks/useKeychainKey'
import useUserProjects from '~/src/client/hooks/useUserProjects'
import { Box } from '@chakra-ui/core'
import { Project } from '~/src/server/db/models/entities/Projects'
import {
  fetchProjectDataPoints,
  decryptMessage
} from '../../src/client/engine/ingest'
import { useSet } from 'react-use'
import { process } from '~/src/client/processing/processor'
import sessionDurationProcessor from '~/src/client/processing/sessionDuration'
import { Event } from '~/src/emitter/events'
import navigationHistoryProcessor from '~/src/client/processing/navigationHistory'

interface Props extends AuthenticatedPage {}

const ProjectView: React.FC<{ project: Project }> = ({ project }) => {
  const [data, { add }] = useSet<{ id: string; event: Event }>()

  React.useEffect(() => {
    fetchProjectDataPoints(project.id).then(messages => {
      messages.forEach(async message => {
        const event = await decryptMessage(message, project.secretKey)
        add(event)
      })
    })
  }, [])

  process(
    Object.values(Array.from(data)).map(d => d.event),
    sessionDurationProcessor
  ).then(console.dir)

  process(
    Object.values(Array.from(data)).map(d => d.event),
    navigationHistoryProcessor
  ).then(console.dir)

  return (
    <>
      <pre>{JSON.stringify(project, null, 2)}</pre>
      {Array.from(data).map(event => (
        <Box as="pre" fontSize="xs" key={event.id}>
          {JSON.stringify(event, null, 2)}
        </Box>
      ))}
    </>
  )
}

const Dashboard: NextPage<Props> = ({}) => {
  const keychainKey = useKeychainKey()
  const projects = useUserProjects(keychainKey)
  return (
    <Box>
      {projects.map(project => (
        <ProjectView key={project.id} project={project} />
      ))}
    </Box>
  )
}

Dashboard.getInitialProps = async (ctx: NextPageContext) => {
  const auth = await authenticatePage(ctx)
  return {
    auth
  }
}

export default Dashboard
