import React from 'react'
import { useChiffreClient } from '../hooks/useChiffreClient'
import gravatarUrl from 'gravatar-url'
import { Avatar, Stack, Box, SelectProps, Text, Select } from '@chakra-ui/core'
import Logo from './Logo'
import { RouteLink } from './primitives/Links'

export interface HeaderProps {}

const Header: React.FC<HeaderProps> = ({}) => {
  return (
    <Stack isInline h={12} px={4} align="center" as="header" spacing={8}>
      <Logo flexShrink={0} h={6} />
      <Stack
        as="nav"
        isInline
        mt={-1}
        alignItems="center"
        h="100%"
        fontWeight="semibold"
        spacing={6}
      >
        <RouteLink to="/analytics">Analytics</RouteLink>
        <RouteLink to="/logs">Logs</RouteLink>
      </Stack>
      {/* <ProjectSelector
        project={project}
        projects={['francoisbest.com', '47ng.com', 'penelopebuckley.com']}
        onProjectChange={setProject}
        mx="auto"
      /> */}
      <UserAvatar ml="auto" />
    </Stack>
  )
}

export default Header

// --

interface ProjectSelectorProps extends SelectProps {
  projects: string[]
  project: string
  onProjectChange: (project: string) => void
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  project,
  projects,
  onProjectChange,
  ...props
}) => {
  if (projects.length === 0) {
    return null
  }
  return (
    <Select
      isReadOnly
      size="sm"
      w="auto"
      value={project}
      onChange={e => onProjectChange(e.target.value)}
      {...props}
    >
      {projects.map(p => (
        <option value={p} key={p}>
          {p}
        </option>
      ))}
    </Select>
  )
}

// --

const UserAvatar = ({ ...props }) => {
  const client = useChiffreClient()
  const username = client.identity?.username
  const url = username ? gravatarUrl(username, { default: 'robohash' }) : ''
  return (
    <Stack {...props} isInline align="center" spacing={4}>
      <Stack spacing={0}>
        <Text fontSize="sm">{client.identity?.username}</Text>
        <Box fontSize="sm" ml="auto">
          <RouteLink to="#" onClick={() => client.logout()}>
            Log out
          </RouteLink>
          <Text as="span"> - </Text>
          <RouteLink to="/settings/auth">Settings</RouteLink>
        </Box>
      </Stack>
      <Avatar size="sm" src={url} />
    </Stack>
  )
}
