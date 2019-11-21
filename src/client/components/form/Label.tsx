import React from 'react'
import { Flex, Text } from '@chakra-ui/core'

const LabelAside = ({ children, ...props }) => (
  <Text
    as="aside"
    display="block"
    fontSize="xs"
    fontWeight="normal"
    color="gray.600"
    {...props}
  >
    {children}
  </Text>
)

export const LabelWithAside = ({ children, aside, htmlFor, ...props }) => (
  <Flex justifyContent="space-between" alignItems="center" mb={2} {...props}>
    <Label htmlFor={htmlFor} mb={0}>
      {children}
    </Label>
    <LabelAside>{aside()}</LabelAside>
  </Flex>
)

const Label = ({ children, ...props }) => (
  <Text
    as="label"
    fontWeight="semibold"
    display="inline-flex"
    mb={2}
    {...props}
  >
    {children}
  </Text>
)

export default Label
