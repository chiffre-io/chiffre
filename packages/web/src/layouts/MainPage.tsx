import React from 'react'
import { Box } from '@chakra-ui/core'
import * as Spaces from 'react-spaces'

export interface MainPageProps {}

const VerticalBar = () => {
  return <Box h="100vh" bg="gray.900"></Box>
}

const MainPage: React.FC<MainPageProps> = ({ children }) => {
  return (
    <Spaces.ViewPort>
      <Spaces.LeftResizable
        size={48}
        handleSize={8}
        maximumSize={480}
        minimumSize={48}
      >
        <VerticalBar />
      </Spaces.LeftResizable>
      <Spaces.Fill scrollable>{children}</Spaces.Fill>
    </Spaces.ViewPort>
  )
}

export default MainPage
