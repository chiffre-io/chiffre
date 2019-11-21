import React from 'react'
import { Text } from '@chakra-ui/core'

export const LabelAside = ({ children, ...props }) => (
  <Text
    as="aside"
    display="inline"
    fontSize="xs"
    fontWeight="normal"
    color="gray.600"
    {...props}
  >
    {children}
  </Text>
)

const Label = ({ children, ...props }) => (
  <Text as="label" fontWeight="semibold" display="flex" mb={2} {...props}>
    {children}
  </Text>
)

export default Label
