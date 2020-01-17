import React from 'react'
import { Box, Flex } from '@chakra-ui/core'

export interface MainPageProps {}

const VerticalBar = () => {
  return <Box w="48px" h="100vh" bg="gray.900"></Box>
}

const MainPage: React.FC<MainPageProps> = ({ children }) => {
  return (
    <Flex>
      <VerticalBar />
      <Box flex="1" bg="gray.100">
        {children}
      </Box>
    </Flex>
  )
}

export default MainPage
