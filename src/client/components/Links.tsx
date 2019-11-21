import React from 'react'
import NextLink from 'next/link'
import { Link as ChakraLink } from '@chakra-ui/core'

export const RouteLink = ({ to, children, ...props }) => (
  <NextLink href={to} passHref>
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
