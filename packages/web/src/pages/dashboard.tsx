import React from 'react'
import { NextPage } from 'next'
import { Box } from '@chakra-ui/core'
import { Project } from '@chiffre/client'
import { useChiffreClient } from '../hooks/useChiffreClient'
import Header from '../components/Header'
import MainPage from '../layouts/MainPage'
import { RouteLink } from '../components/primitives/Links'

const ProjectView: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <>
      <RouteLink to="/projects/[projectID]" as={`/projects/${project.id}`}>
        {project.name}
      </RouteLink>
      <Box as="pre" fontSize="xs">
        {JSON.stringify(project, null, 2)}
      </Box>
    </>
  )
}

const Dashboard: NextPage = () => {
  const client = useChiffreClient()
  return (
    <MainPage>
      <Header />
      <Box>
        {client.projects.map(project => (
          <ProjectView key={project.id} project={project} />
        ))}
      </Box>
    </MainPage>
  )
}

export default Dashboard
