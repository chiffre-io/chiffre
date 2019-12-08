import React from 'react'
import { RouteLink } from '~/src/client/components/Links'
import { Text, Collapse, useColorMode } from '@chakra-ui/core'

const Paragraph = ({ children, ...props }) => {
  const dark = useColorMode().colorMode === 'dark'
  return (
    <Text
      fontSize="sm"
      color={dark ? 'gray.500' : 'gray.700'}
      mb={2}
      {...props}
    >
      {children}
    </Text>
  )
}

// --

const AboutPasswords = ({ revealed }) => {
  return (
    <Collapse isOpen={revealed}>
      <Paragraph>Your master password is the key to your account.</Paragraph>
      <Paragraph>
        It is never sent to us, so we'll have{' '}
        <Text as="span" fontWeight="semibold">
          no way
        </Text>{' '}
        to reset it for you. Keep it somewhere safe !
      </Paragraph>
      <Paragraph>
        We recommend you use a secure password manager to generate a long and
        complex password*, and store it there.
      </Paragraph>
      <Paragraph>
        Learn more about our{' '}
        <RouteLink href="/legal/security-policy">Security Policy</RouteLink>.
      </Paragraph>
      <Paragraph mb={4}>
        * <i>Recommended : 64+ characters of all sorts</i>
      </Paragraph>
    </Collapse>
  )
}

export default AboutPasswords
