import React from 'react'
import { NextPage } from 'next'
import { Box, Button } from '@chakra-ui/core'
import { Project } from '@chiffre/client'
import { useChiffreClient } from '../hooks/useChiffreClient'
import Header from '../components/Header'
import MainPage from '../layouts/MainPage'

const ProjectView: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <>
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
      <Button
        onClick={() => {
          client.getAccountActivity()
        }}
      >
        Refresh activity
      </Button>
      <Box>
        {client.projects.map(project => (
          <ProjectView key={project.id} project={project} />
        ))}
      </Box>
    </MainPage>
  )
}

export default Dashboard
