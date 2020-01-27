import React from 'react'
import { Stack } from '@chakra-ui/core'
import Logo from '../../components/Logo'
import Section from './Section'
import { ButtonRouteLink } from '../../components/primitives/Links'

const Header = () => {
  return (
    <Section
      as="header"
      containerProps={{
        display: 'flex',
        alignItems: 'center',
        px: 4,
        py: 2
      }}
      backgroundColor="gray.800"
    >
      <Logo dark flexShrink={0} />
      <Stack isInline as="nav" spacing={8} ml={12}>
        <ButtonRouteLink to="/analytics" variant="link" fontWeight="normal">
          Analytics
        </ButtonRouteLink>
        <ButtonRouteLink to="/pricing" variant="link" fontWeight="normal">
          Pricing
        </ButtonRouteLink>
      </Stack>
      <Stack isInline as="nav" ml="auto" spacing={4}>
        <ButtonRouteLink
          to="/login?redirect=/dashboard"
          fontWeight="normal"
          variant="ghost"
          variantColor="blue"
          display="flex"
        >
          Sign in
        </ButtonRouteLink>
        <ButtonRouteLink
          prefetch
          to="/signup"
          // fontWeight="normal"
          variantColor="green"
          display="flex"
        >
          Sign up
        </ButtonRouteLink>
      </Stack>
    </Section>
  )
}

export default Header
