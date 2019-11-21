import React from 'react'
import { Box, Grid, useColorMode } from '@chakra-ui/core'

const PasswordStrengthSkeleton: React.SFC = () => {
  const dark = useColorMode().colorMode === 'dark'
  const gray = dark ? 'gray.700' : 'gray.200'

  return (
    <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap={2}>
      <Box backgroundColor={gray} borderRadius={3} h="0.35rem" />
      <Box backgroundColor={gray} borderRadius={3} h="0.35rem" />
      <Box backgroundColor={gray} borderRadius={3} h="0.35rem" />
      <Box backgroundColor={gray} borderRadius={3} h="0.35rem" />
    </Grid>
  )
}

export default PasswordStrengthSkeleton
