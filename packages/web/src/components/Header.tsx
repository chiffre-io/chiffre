import React from 'react'
import { useChiffreClient } from '../hooks/useChiffreClient'
import gravatarUrl from 'gravatar-url'
import { Avatar, Stack, Box, Text, Button } from '@chakra-ui/core'
import Logo from './Logo'
import { RouteLink } from './primitives/Links'
import { useRedirectToLoginUrl } from '../hooks/useRedirectToLogin'

export interface HeaderProps {}

const Header: React.FC<HeaderProps> = ({}) => {
  return (
    <Stack isInline h={12} px={2} align="center" as="header" spacing={8}>
      <Logo flexShrink={0} h={5} display={['none', 'block']} />
      <Stack
        as="nav"
        isInline
        mt={-1}
        alignItems="center"
        h="100%"
        fontWeight="semibold"
        spacing={6}
      >
        <RouteLink to="/dashboard">Dashboard</RouteLink>
        <RouteLink to="/new">New Project</RouteLink>
      </Stack>
      <UserAvatar ml="auto" />
    </Stack>
  )
}

export default Header

// --

const UserAvatar = ({ ...props }) => {
  const client = useChiffreClient()
  const username = client.identity?.username
  const url = username ? gravatarUrl(username, { default: 'robohash' }) : ''
  const redirectToLoginUrl = useRedirectToLoginUrl()
  return client.isLocked ? (
    <Stack {...props} isInline align="center" spacing={4}>
      <RouteLink to={redirectToLoginUrl}>
        <Button size="sm" variantColor="blue" variant="ghost">
          Log in
        </Button>
      </RouteLink>
      <RouteLink to="/signup">
        <Button size="sm" variantColor="green">
          Sign up
        </Button>
      </RouteLink>
    </Stack>
  ) : (
    <Stack {...props} isInline align="center" spacing={4}>
      <Stack spacing={0}>
        <Text fontSize="sm" textAlign="right" color="gray.800">
          {client.identity?.displayName || client.identity?.username}
        </Text>
        <Box fontSize="sm" ml="auto">
          <RouteLink to="#" onClick={() => client.logout()}>
            Log out
          </RouteLink>
          <Text as="span"> - </Text>
          <RouteLink to="/settings/auth">Settings</RouteLink>
        </Box>
      </Stack>
      <RouteLink to={'/profile'}>
        <Avatar size="sm" src={url} />
      </RouteLink>
    </Stack>
  )
}
