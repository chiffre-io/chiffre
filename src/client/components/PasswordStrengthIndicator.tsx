import React from 'react'
import { Box, Grid, Text, Flex, Link } from '@chakra-ui/core'
import usePasswordStrength, {
  PasswordStrength
} from '../hooks/usePasswordStrength'

export interface Props {
  password: string
}

const getColors = (strength: PasswordStrength) => {
  switch (strength) {
    default:
    case PasswordStrength.empty:
      return ['gray.200', 'gray.200', 'gray.200', 'gray.200']
    case PasswordStrength.tooShort:
      return ['red.600', 'gray.200', 'gray.200', 'gray.200']
    case PasswordStrength.weak:
      return ['orange.500', 'orange.500', 'gray.200', 'gray.200']
    case PasswordStrength.good:
      return ['teal.500', 'teal.500', 'teal.500', 'gray.200']
    case PasswordStrength.strong:
      return ['green.500', 'green.500', 'green.500', 'green.500']
    case PasswordStrength.pwned:
      return ['red.600', 'red.600', 'red.600', 'red.600']
  }
}

const getTextAndColor = (strength: PasswordStrength) => {
  switch (strength) {
    default:
    case PasswordStrength.empty:
      return { text: null, color: null }
    case PasswordStrength.tooShort:
      return { text: 'Too short', color: 'red.600' }
    case PasswordStrength.weak:
      return { text: 'Weak password', color: 'orange.500' }
    case PasswordStrength.good:
      return { text: 'Good password', color: 'teal.500' }
    case PasswordStrength.strong:
      return { text: 'Strong password', color: 'green.500' }
    case PasswordStrength.pwned:
      return { text: 'Unsafe password !', color: 'red.600' }
  }
}

const PasswordStrengthIndicator: React.SFC<Props> = ({ password }) => {
  const strength = usePasswordStrength(password)
  const colors = getColors(strength)

  const { text, color: textColor } = getTextAndColor(strength)

  return (
    <>
      <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap={2}>
        <Box backgroundColor={colors[0]} borderRadius={3} h="0.35rem" />
        <Box backgroundColor={colors[1]} borderRadius={3} h="0.35rem" />
        <Box backgroundColor={colors[2]} borderRadius={3} h="0.35rem" />
        <Box backgroundColor={colors[3]} borderRadius={3} h="0.35rem" />
      </Grid>
      {text && (
        <Flex justifyContent="space-between" mt={1}>
          <Text color={textColor} flexShrink={0}>
            {text}
          </Text>
          {(strength === PasswordStrength.tooShort ||
            strength === PasswordStrength.weak) && (
            <Text fontSize="xs" color="gray.500" ml={4} textAlign="right">
              consider using a password manager
            </Text>
          )}
        </Flex>
      )}
      {strength === PasswordStrength.pwned && (
        <>
          <Text color="gray.700" fontSize="sm" mt={4} mb={2}>
            This password has leaked on the internet and should not be used. If
            you use it somewhere else, go change it now.
            <br />
            We recommend you use a secure password manager.
          </Text>
          <Text color="gray.700" fontSize="sm">
            Learn more :{' '}
            <Link
              href="https://haveibeenpwned.com/"
              target="_blank"
              textDecoration="underline"
            >
              haveibeenpwned.com
            </Link>
          </Text>
        </>
      )}
    </>
  )
}

export default PasswordStrengthIndicator
