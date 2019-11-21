import React from 'react'
import { Text, useColorMode } from '@chakra-ui/core'

const FieldHelpText = ({ children, ...props }) => {
  const dark = useColorMode().colorMode === 'dark'
  return (
    <Text
      fontSize="sm"
      color={dark ? 'gray.400' : 'gray.600'}
      mb={2}
      {...props}
    >
      {children}
    </Text>
  )
}

export default FieldHelpText
