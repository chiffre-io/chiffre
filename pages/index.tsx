import React from 'react'
import PasswordStrengthIndicator from '../src/client/views/auth/signup/PasswordStrengthIndicator'
import { Box, Flex, Input, Text, Button, useColorMode } from '@chakra-ui/core'
import PasswordInput from '../src/client/components/form/PasswordInput'
import useEvent from '../src/client/hooks/useEvents'
import Logo from '../src/client/components/Logo'

const FormLabel = ({ children, ...props }) => (
  <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2} {...props}>
    {children}
  </Text>
)

const Home = () => {
  const [password, setPassword] = React.useState('')

  useEvent('foo', null)

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
      backgroundColor={dark ? 'gray.900' : 'gray.200'}
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
        <Box p={4}>
          <FormLabel>Account</FormLabel>
          <Input
            type="email"
            placeholder="email address"
            _placeholder={{
              color: 'gray.500'
            }}
            mb={4}
            borderColor={dark ? 'gray.700' : 'gray.400'}
          />
          <FormLabel>Password</FormLabel>
          <PasswordInput
            onPasswordChange={setPassword}
            value={password}
            mb={2}
            _placeholder={{
              color: 'gray.500'
            }}
            borderColor={dark ? 'gray.700' : 'gray.400'}
            letterSpacing={password.length > 0 ? '0.05em' : 'auto'}
          />
          <PasswordStrengthIndicator password={password} />
          <Button width="100%" variantColor="blue" mt={6}>
            Login
          </Button>
        </Box>
      </Box>
    </Flex>
  )
}

export default Home
