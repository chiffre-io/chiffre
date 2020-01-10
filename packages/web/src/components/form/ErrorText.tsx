import React from 'react'
import { Text, useColorMode } from '@chakra-ui/core'

const ErrorText = ({ children, bold = false, ...props }) => {
  const dark = useColorMode().colorMode === 'dark'
  return (
    <Text
      fontSize="xs"
      fontWeight={bold ? 'semibold' : 'normal'}
      color={dark ? 'red.500' : 'red.600'}
      mb={2}
      {...props}
    >
      {children}
    </Text>
  )
}

export default ErrorText
