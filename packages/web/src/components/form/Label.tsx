import React from 'react'
import { Flex, Text, FormLabel } from '@chakra-ui/core'

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

export const LabelWithAside = ({
  children,
  aside,
  asideLeft = false,
  htmlFor,
  ...props
}) => (
  <Flex
    justifyContent={asideLeft ? 'flex-start' : 'space-between'}
    alignItems="baseline"
    {...props}
  >
    <Label htmlFor={htmlFor} mb={0}>
      {children}
    </Label>
    <LabelAside ml={asideLeft && -1}>{aside()}</LabelAside>
  </Flex>
)

const Label = ({ children, ...props }) => (
  <FormLabel as="label" fontWeight="semibold" display="inline-flex" {...props}>
    {children}
  </FormLabel>
)

export default Label
