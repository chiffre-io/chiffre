import React from 'react'
import { Box, Grid, Text, Flex, useColorMode, Collapse } from '@chakra-ui/core'
import { Bar } from './PasswordStrengthSkeleton'
import usePasswordStrength from './usePasswordStrength'
import { OutgoingLink } from '../../../components/primitives/Links'
import { PasswordStrength } from './passwordSettings'

export interface Props {
  password: string
  onStrengthChange: (strength: PasswordStrength) => void
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
      return { show: false, text: 'Too short', color: red }
    case PasswordStrength.tooShort:
      return { show: true, text: 'Too short', color: red }
    case PasswordStrength.weak:
      return { show: true, text: 'Weak password', color: orange }
    case PasswordStrength.good:
      return { show: true, text: 'Good password', color: teal }
    case PasswordStrength.strong:
      return { show: true, text: 'Strong password', color: green }
    case PasswordStrength.pwned:
      return { show: true, text: 'Unsafe password !', color: red }
  }
}

const PasswordStrengthIndicator: React.FC<Props> = ({
  password,
  onStrengthChange,
  ...props
}) => {
  const strength = usePasswordStrength(password)
  const colors = useSegmentColors(strength)
  const dark = useColorMode().colorMode === 'dark'

  const { show: showText, text, color: textColor } = useTextAndColor(strength)

  React.useEffect(() => {
    onStrengthChange(strength)
  }, [strength])

  return (
    <Box {...props}>
      <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap={2}>
        <Bar color={colors[0]} />
        <Bar color={colors[1]} />
        <Bar color={colors[2]} />
        <Bar color={colors[3]} />
      </Grid>
      {showText && (
        <Flex justifyContent="space-between" mt={1}>
          <Text
            color={textColor}
            flexShrink={0}
            fontSize="sm"
            fontWeight={
              strength === PasswordStrength.pwned && !dark
                ? 'semibold'
                : 'normal'
            }
            // fontWeight={dark ? 'normal' : 'semibold'}
          >
            {text}
          </Text>
          {(strength === PasswordStrength.tooShort ||
            strength === PasswordStrength.weak) && (
            <Text fontSize="xs" color="gray.600" ml={4} textAlign="right">
              consider using a password manager
            </Text>
          )}
        </Flex>
      )}
      <Collapse isOpen={strength === PasswordStrength.pwned}>
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
            <OutgoingLink
              href="https://haveibeenpwned.com/"
              textDecoration="underline"
            >
              haveibeenpwned.com
            </OutgoingLink>
          </Text>
        </>
      </Collapse>
    </Box>
  )
}

export default PasswordStrengthIndicator
