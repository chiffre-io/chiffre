import React from 'react'
import NextLink from 'next/link'
import { Link as ChakraLink, Button } from '@chakra-ui/core'

export const RouteLink = ({ href, children, ...props }) => (
  <NextLink href={href} passHref>
    <ChakraLink textDecoration="underline" {...props}>
      {children}
    </ChakraLink>
  </NextLink>
)

export const AnchorLink = ({ href, children, ...props }) => (
  <ChakraLink href={href} textDecoration="underline" {...props}>
    {children}
  </ChakraLink>
)

export const ButtonLink = ({ href, children, ...props }) => (
  <NextLink href={href} passHref>
    <Button as="a" {...props}>
      {children}
    </Button>
  </NextLink>
)
