import React from 'react'
import { Box, Grid, Text, Flex, Link, useColorMode } from '@chakra-ui/core'
import usePasswordStrength, {
  PasswordStrength
} from '../hooks/usePasswordStrength'

export interface Props {
  password: string
}

const useColors = () => {
  const dark = useColorMode().colorMode === 'dark'
  const gray = dark ? 'gray.700' : 'gray.200'
  const red = dark ? 'red.500' : 'red.600'
  const green = dark ? 'green.400' : 'green.500'
  const teal = dark ? 'teal.400' : 'teal.500'
  const orange = dark ? 'orange.400' : 'orange.500'
  return {
    gray,
    red,
    green,
    teal,
    orange
  }
}

const useSegmentColors = (strength: PasswordStrength) => {
  const { gray, red, orange, teal, green } = useColors()
  switch (strength) {
    default:
    case PasswordStrength.empty:
      return [gray, gray, gray, gray]
    case PasswordStrength.tooShort:
      return [red, gray, gray, gray]
    case PasswordStrength.weak:
      return [orange, orange, gray, gray]
    case PasswordStrength.good:
      return [teal, teal, teal, gray]
    case PasswordStrength.strong:
      return [green, green, green, green]
    case PasswordStrength.pwned:
      return [red, red, red, red]
  }
}

const useTextAndColor = (strength: PasswordStrength) => {
  const { red, orange, teal, green } = useColors()
  switch (strength) {
    default:
    case PasswordStrength.empty:
      return { text: null, color: null }
    case PasswordStrength.tooShort:
      return { text: 'Too short', color: red }
    case PasswordStrength.weak:
      return { text: 'Weak password', color: orange }
    case PasswordStrength.good:
      return { text: 'Good password', color: teal }
    case PasswordStrength.strong:
      return { text: 'Strong password', color: green }
    case PasswordStrength.pwned:
      return { text: 'Unsafe password !', color: red }
  }
}

const PasswordStrengthIndicator: React.SFC<Props> = ({ password }) => {
  const strength = usePasswordStrength(password)
  const colors = useSegmentColors(strength)
  const dark = useColorMode().colorMode === 'dark'

  const { text, color: textColor } = useTextAndColor(strength)

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
          <Text
            color={textColor}
            flexShrink={0}
            fontSize="sm"
            fontWeight={dark ? 'normal' : 'semibold'}
          >
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
          <Text
            color={dark ? 'gray.500' : 'gray.700'}
            fontSize="sm"
            mt={4}
            mb={2}
          >
            This password has leaked on the internet and should not be used. If
            you use it somewhere else, go change it now.
            <br />
            We recommend you use a secure password manager.
          </Text>
          <Text color={dark ? 'gray.500' : 'gray.700'} fontSize="sm">
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
