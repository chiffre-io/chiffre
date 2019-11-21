import React from 'react'
import { Box, Grid, useColorMode } from '@chakra-ui/core'

export interface BarProps {
  color: string
}

export const Bar: React.SFC<BarProps> = ({ color, ...props }) => (
  <Box
    backgroundColor={color}
    borderRadius={3}
    h="0.35rem"
    transition="background-color 0.15s ease"
    {...props}
  />
)

const PasswordStrengthSkeleton: React.SFC = () => {
  const dark = useColorMode().colorMode === 'dark'
  const gray = dark ? 'gray.700' : 'gray.200'

  return (
    <Grid gridTemplateColumns="repeat(4, 1fr)" gridGap={2}>
      <Bar color={gray} />
      <Bar color={gray} />
      <Bar color={gray} />
      <Bar color={gray} />
    </Grid>
  )
}

export default PasswordStrengthSkeleton
