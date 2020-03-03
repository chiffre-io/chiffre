import React from 'react'
import Head from 'next/head'
import { NextPage } from 'next'
import { Stack, Text, PseudoBox, PseudoBoxProps, Avatar } from '@chakra-ui/core'
import { Project } from '@chiffre/client'
import {
  useChiffreClient,
  useRedirectToLoginWhenLocked
} from '../hooks/useChiffreClient'
import MainPage from '../layouts/MainPage'
import { RouteLink } from '../components/primitives/Links'

interface ProjectViewProps extends PseudoBoxProps {
  project: Project
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, ...props }) => {
  return (
    <PseudoBox
      p={4}
      bg="white"
      borderRadius={4}
      shadow="sm"
      transition="all 0.2s ease"
      overflow="hidden"
      {...props}
    >
      <Stack spacing={4}>
        <Stack isInline spacing={4}>
          <RouteLink to="/projects/[projectID]" as={`/projects/${project.id}`}>
            <Avatar
              src={`${project.url}/favicon.ico`}
              name={project.name}
              rounded="full"
              bg="gray.200"
              color="gray.600"
            />
          </RouteLink>
          <Stack spacing={0}>
            <RouteLink
              to="/projects/[projectID]"
              as={`/projects/${project.id}`}
            >
              <Text fontSize="lg" color="gray.800">
                {project.name}
              </Text>
            </RouteLink>
            <Text fontSize="sm" color="gray.600">
              {project.url}
            </Text>
          </Stack>
        </Stack>
        <Text>{project.description}</Text>
      </Stack>
    </PseudoBox>
  )
}

const Dashboard: NextPage = () => {
  // useRedirectToLoginWhenLocked()
  const client = useChiffreClient()
  return (
    <MainPage>
      <Head>
        <title>Dashboard | Chiffre</title>
      </Head>
      <Stack spacing={8} px={4} py={12} maxW="xl" mx="auto">
        {client.projects.map(project => (
          <ProjectView key={project.id} project={project} />
        ))}
      </Stack>
    </MainPage>
  )
}

export default Dashboard
