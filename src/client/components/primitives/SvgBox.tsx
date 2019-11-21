import React, { SVGAttributes } from 'react'
import { Box, BoxProps } from '@chakra-ui/core'

export type SvgBoxProps = BoxProps &
  Pick<SVGAttributes<HTMLOrSVGElement>, 'xmlns' | 'viewBox'>

const SvgBox: React.SFC<SvgBoxProps> = ({ children, ...props }) => (
  <Box as="svg" xmlns="http://www.w3.org/2000/svg" {...props}>
    {children}
  </Box>
)

export default SvgBox
