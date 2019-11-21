import React from 'react'
import { Text, useColorMode } from '@chakra-ui/core'

export const LabelAside = ({ children, ...props }) => (
  <Text as="span" fontSize="xs" fontWeight="normal" color="gray.600" {...props}>
    {children}
  </Text>
)

const Label = ({ children, ...props }) => {
  const dark = useColorMode().colorMode === 'dark'

  return (
    <Text
      as="label"
      fontWeight="semibold"
      color={dark ? 'gray.400' : 'gray.700'}
      display="flex"
      mb={2}
      {...props}
    >
      {children}
    </Text>
  )
}

export default Label
