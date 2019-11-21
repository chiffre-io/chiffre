import React from 'react'
import { Text } from '@chakra-ui/core'

export const LabelAside = ({ children, ...props }) => (
  <Text as="span" fontSize="xs" fontWeight="normal" color="gray.500" {...props}>
    {children}
  </Text>
)

const Label = ({ children, ...props }) => (
  <Text
    as="label"
    fontSize="sm"
    fontWeight="semibold"
    color="gray.600"
    display="flex"
    mb={2}
    {...props}
  >
    {children}
  </Text>
)

export default Label
