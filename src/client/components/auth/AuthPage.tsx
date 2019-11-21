import React from 'react'
import { Box, Flex, useColorMode } from '@chakra-ui/core'
import Logo from '../Logo'
import theme from '../../ui/theme'

const AuthPage = ({ children }) => {
  const dark = useColorMode().colorMode === 'dark'

  return (
    <Flex
      h="100vh"
      direction="column"
      justifyContent={{
        _: 'flex-start',
        sm: 'center'
      }}
      alignItems={{
        _: 'stretch',
        sm: 'center'
      }}
      // backgroundColor={dark ? 'gray.900' : 'gray.200'}
      background={`linear-gradient(90deg, ${
        theme.colors.gray[dark ? 900 : 200]
      } 19px,transparent 1%) center,linear-gradient(${
        theme.colors.gray[dark ? 900 : 200]
      } 19px,transparent 1%) center, ${theme.colors.gray[dark ? 800 : 400]}`}
      backgroundSize="20px 20px"
    >
      <Box
        w={{
          _: '100%',
          sm: '400px'
        }}
        h={{
          _: '100%',
          sm: 'auto'
        }}
        minH="30vh"
        boxShadow="sm"
        backgroundColor={dark ? 'gray.800' : 'white'}
        borderRadius="5px"
        overflow="scroll"
      >
        <Box
          backgroundColor={dark ? 'gray.700' : 'gray.100'}
          pt={6}
          pb={5}
          borderBottomColor={dark ? 'gray.600' : 'gray.300'}
          borderBottomWidth="1px"
        >
          <Logo mx="auto" dark={dark} />
        </Box>
        <Box p={4}>{children}</Box>
      </Box>
    </Flex>
  )
}

export default AuthPage
