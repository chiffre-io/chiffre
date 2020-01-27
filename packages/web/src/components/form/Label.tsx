import React from 'react'
import { Flex, Text, FormLabel, FlexProps } from '@chakra-ui/core'

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

interface LabelWithAsideProps extends FlexProps {
  htmlFor: string
  aside: () => string | React.ReactElement
  asideLeft?: boolean
}

export const LabelWithAside = React.forwardRef<any, LabelWithAsideProps>(
  ({ children, aside, asideLeft = false, htmlFor, ...props }, ref) => (
    <Flex
      justifyContent={asideLeft ? 'flex-start' : 'space-between'}
      alignItems="baseline"
      ref={ref}
      {...props}
    >
      <Label htmlFor={htmlFor} mb={0}>
        {children}
      </Label>
      <LabelAside ml={asideLeft && -1}>{aside()}</LabelAside>
    </Flex>
  )
)

const Label = ({ children, ...props }) => (
  <FormLabel as="label" fontWeight="semibold" display="inline-flex" {...props}>
    {children}
  </FormLabel>
)

export default Label
