import React from 'react'
import { useFormikContext } from 'formik'
import { Text } from '@chakra-ui/core'

const Debug = () => {
  const { values } = useFormikContext()
  return (
    <Text as="pre" fontSize="xs">
      <code>{JSON.stringify(values, null, 2)}</code>
    </Text>
  )
}

export default Debug
