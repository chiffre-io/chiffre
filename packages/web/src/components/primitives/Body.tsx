import React from 'react'
import { useTheme } from '@chakra-ui/core'

export interface Props {
  shade: number
}
const Body: React.FC<Props> = ({ shade }) => {
  const theme = useTheme()
  const color = theme.colors.gray[shade]
  return (
    <style global jsx>{`
      html,
      body {
        background-color: ${color};
      }
    `}</style>
  )
}

export default Body
