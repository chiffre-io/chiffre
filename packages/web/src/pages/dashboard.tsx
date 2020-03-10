import React from 'react'
import Head from 'next/head'
import { NextPage } from 'next'
import { Stack, Text, PseudoBox, PseudoBoxProps, Avatar } from '@chakra-ui/core'
import { Project } from '@chiffre/client'
import { useChiffreClient } from '../hooks/useChiffreClient'
import MainPage from '../layouts/MainPage'
import { RouteLink, ButtonRouteLink } from '../components/primitives/Links'
import useRedirectToLogin from '../hooks/useRedirectToLogin'
import { StackContainer } from '../layouts/Container'
import Title from '../components/head/Title'

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
      w="100%"
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
  const client = useChiffreClient()
  const redirectToLogin = useRedirectToLogin()
  React.useEffect(() => {
    ;(async () => {
      try {
        await client.loadProjects()
      } catch (error) {
        await redirectToLogin()
      }
    })()
  }, [client])

  return (
    <>
      <Title>Dashboard</Title>
      <MainPage>
        <Head>
          <title>Dashboard | Chiffre</title>
        </Head>
        <StackContainer spacing={8} py={12} alignItems="center">
          {client.projects.map(project => (
            <ProjectView key={project.id} project={project} />
          ))}
          {client.projects.length === 0 && (
            <Text>Start by creating a project</Text>
          )}
          <ButtonRouteLink
            to="/new"
            w="auto"
            variantColor="green"
            leftIcon="add"
          >
            Create new project
          </ButtonRouteLink>
        </StackContainer>
      </MainPage>
    </>
  )
}

export default Dashboard
