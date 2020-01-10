import { Box } from '@chakra-ui/core'

const Section = ({ children, containerProps = {}, ...props }) => {
  return (
    <Box as="section" {...props}>
      <Box maxW="6xl" mx="auto" {...containerProps}>
        {children}
      </Box>
    </Box>
  )
}

export default Section
