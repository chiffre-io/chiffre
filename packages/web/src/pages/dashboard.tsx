import React from 'react'
import { NextPage } from 'next'
import { Box, Button } from '@chakra-ui/core'
import { Project } from '@chiffre/client'
import { useChiffreClient } from '@chiffre/client-react'

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
    <>
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
    </>
  )
}

export default Dashboard
