import { Box, BoxProps } from '@chakra-ui/core'

export const TableHead: React.FC<BoxProps & HTMLTableElement> = ({
  children,
  ...props
}) => {
  return (
    <Box as="thead" {...props}>
      {children}
    </Box>
  )
}
