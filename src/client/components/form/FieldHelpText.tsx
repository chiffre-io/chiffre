import React from 'react'
import { useColorMode, FormHelperText } from '@chakra-ui/core'

const FieldHelpText = ({ children, ...props }) => {
  const dark = useColorMode().colorMode === 'dark'
  return (
    <FormHelperText
      fontSize="sm"
      color={dark ? 'gray.400' : 'gray.600'}
      m="0"
      mb={2}
      {...props}
    >
      {children}
    </FormHelperText>
  )
}

export default FieldHelpText
