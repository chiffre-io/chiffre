import React from 'react'
import { NextPage, NextPageContext } from 'next'
// import { authenticatePage, AuthenticatedPageProps } from '~/src/shared/auth'
import useKeychainKey from '../../src/hooks/useKeychainKey'
// import useUserProjects from '../../src/hooks/useUserProjects'
import { Box } from '@chakra-ui/core'
// import { Project } from '~/src/db/models/entities/Projects'
// import { fetchProjectDataPoints, decryptMessage } from '../../src/engine/ingest'
import { useSet } from 'react-use'
// import { process } from '../../../../src/processing/processor'
//import sessionDurationProcessor from '../../../../src/processing/sessionDuration'
// import { Event } from '~/src/emitter/events'
// import navigationHistoryProcessor from '../../../../src/processing/navigationHistory'

interface Props {} // extends AuthenticatedPageProps {}

// const ProjectView: React.FC<{ project: Project }> = ({ project }) => {
//   const [data, { add }] = useSet<{ id: string; event: Event }>()

//   // React.useEffect(() => {
//   //   fetchProjectDataPoints(project.id).then(messages => {
//   //     messages.forEach(async message => {
//   //       const event = await decryptMessage(message, project.secretKey)
//   //       add(event)
//   //     })
//   //   })
//   // }, [])

//   // process(
//   //   Object.values(Array.from(data)).map(d => d.event),
//   //   sessionDurationProcessor
//   // ).then(console.dir)

//   // process(
//   //   Object.values(Array.from(data)).map(d => d.event),
//   //   navigationHistoryProcessor
//   // ).then(console.dir)

//   return (
//     <>
//       <pre>{JSON.stringify(project, null, 2)}</pre>
//       {Array.from(data).map(event => (
//         <Box as="pre" fontSize="xs" key={event.id}>
//           {JSON.stringify(event, null, 2)}
//         </Box>
//       ))}
//     </>
//   )
// }

const Dashboard: NextPage<Props> = ({}) => {
  const keychainKey = useKeychainKey()
  const projects = [] // useUserProjects(keychainKey)
  return (
    <Box>
      {/* {projects.map(project => (
        <ProjectView key={project.id} project={project} />
      ))} */}
    </Box>
  )
}

// Dashboard.getInitialProps = async (ctx: NextPageContext) => {
//   const auth = await authenticatePage(ctx)
//   return {
//     auth
//   }
// }

export default Dashboard
