import React from 'react'
import { Stack, Button } from '@chakra-ui/core'
import Logo from '~/src/client/components/Logo'
import Section from './Section'
import Link from 'next/link'
import { ButtonLink } from '../../components/Links'

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
        <ButtonLink href="/analytics" variant="link" fontWeight="normal">
          Analytics
        </ButtonLink>
        <ButtonLink href="/pricing" variant="link" fontWeight="normal">
          Pricing
        </ButtonLink>
      </Stack>
      <Stack isInline as="nav" ml="auto" spacing={4}>
        <ButtonLink
          href="/login?redirect=/dashboard"
          fontWeight="normal"
          variant="ghost"
          variantColor="blue"
          display="flex"
        >
          Sign in
        </ButtonLink>
        <ButtonLink
          prefetch
          href="/signup"
          // fontWeight="normal"
          variantColor="green"
          display="flex"
        >
          Sign up
        </ButtonLink>
      </Stack>
    </Section>
  )
}

export default Header
