import React from 'react'
import {
  Input,
  Button,
  useColorMode,
  InputGroup,
  InputLeftElement,
  Icon,
  Text
} from '@chakra-ui/core'
import PasswordInput from '../../components/PasswordInput'
import Label from '../../components/form/Label'
import { RouteLink } from '../../components/Links'

const LoginForm = () => {
  const [password, setPassword] = React.useState('')
  const dark = useColorMode().colorMode === 'dark'

  return (
    <>
      <Label htmlFor="email">Account</Label>
      <InputGroup>
        <InputLeftElement children={<Icon name="at-sign" color="gray.500" />} />
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="email address"
          _placeholder={{
            color: 'gray.500'
          }}
          mb={4}
          borderColor={dark ? 'gray.700' : 'gray.400'}
        />
      </InputGroup>
      <Label htmlFor="password">Master Password</Label>
      <PasswordInput
        id="password"
        name="password"
        onPasswordChange={setPassword}
        value={password}
        mb={2}
        _placeholder={{
          color: 'gray.500'
        }}
        borderColor={dark ? 'gray.700' : 'gray.400'}
        letterSpacing={password.length > 0 ? '0.05em' : 'auto'}
      />
      <Button width="100%" variantColor="blue" mt={6}>
        Sign in to your account
      </Button>
      <Text
        textAlign="center"
        mt={4}
        fontSize="sm"
        color={dark ? 'gray.500' : 'gray.600'}
      >
        Don't have an account ?{' '}
        <RouteLink to="/signup" color={dark ? 'gray.400' : 'gray.700'}>
          Sign up
        </RouteLink>
      </Text>
    </>
  )
}

export default LoginForm
