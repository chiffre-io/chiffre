import React from 'react'
import { useChiffreClient } from '../hooks/useChiffreClient'
import gravatarUrl from 'gravatar-url'
import {
  Avatar,
  Stack,
  Box,
  Text,
  Input,
  DarkMode,
  InputGroup,
  InputRightElement,
  Icon
} from '@chakra-ui/core'
import Logo from './Logo'
import { RouteLink } from './primitives/Links'

const UserAvatar = ({ ...props }) => {
  const client = useChiffreClient()
  const username = client.identity?.username
  const url = username ? gravatarUrl(username, { default: 'robohash' }) : ''
  return (
    <Stack {...props} isInline align="center" spacing={4}>
      <Stack spacing={0}>
        <Text fontSize="sm" color="gray.500">
          {client.identity?.username}
        </Text>
        <Box fontSize="sm" color="gray.400" ml="auto">
          <RouteLink to="#" onClick={() => client.logout()}>
            Log out
          </RouteLink>
          <Text color="gray.600" as="span">
            {' '}
            -{' '}
          </Text>
          <RouteLink to="/settings/auth">Settings</RouteLink>
        </Box>
      </Stack>
      <Avatar size="sm" src={url} />
    </Stack>
  )
}

export interface HeaderProps {
  onSearch?: (search: string) => void
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  return (
    // <Spaces.Top size={48} as="header">
    <DarkMode>
      <Stack isInline bg="gray.800" h="48px" p={2} align="center" as="header">
        <Logo dark flexShrink={0} />
        {!!onSearch && (
          <InputGroup size="sm" ml={8} mt="-2px">
            <Input
              placeholder="Search"
              _placeholder={{
                color: 'gray.500'
              }}
              color="gray.300"
              isFullWidth={false}
              borderRadius="100px"
              minW="300px"
              onChange={e => onSearch(e.target.value)}
            />
            <InputRightElement
              children={<Icon name="search" color="gray.500" />}
            />
          </InputGroup>
        )}
        <Stack
          as="nav"
          isInline
          alignItems="center"
          color="gray.400"
          backgroundColor="red"
          spacing={4}
          ml={8}
        >
          <RouteLink to="/dashboard">Dashboard</RouteLink>
          <RouteLink to="/activity">Activity</RouteLink>
          <RouteLink to="/new">New Project</RouteLink>
        </Stack>
        <UserAvatar ml="auto" />
      </Stack>
    </DarkMode>
    // </Spaces.Top>
  )
}

export default Header
