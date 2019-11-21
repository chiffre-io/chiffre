import React from 'react'
import {
  Input,
  Button,
  useColorMode,
  InputGroup,
  InputLeftElement,
  Icon,
  Link,
  Text
} from '@chakra-ui/core'
import AuthPage from '../src/client/components/auth/AuthPage'
import PasswordInput from '../src/client/components/PasswordInput'
import Label from '../src/client/components/form/Label'

const LoginPage = () => {
  const [password, setPassword] = React.useState('')
  const dark = useColorMode().colorMode === 'dark'

  return (
    <AuthPage>
      <Label>Account</Label>
      <InputGroup>
        <InputLeftElement children={<Icon name="at-sign" color="gray.500" />} />
        <Input
          type="email"
          placeholder="email address"
          _placeholder={{
            color: 'gray.500'
          }}
          mb={4}
          borderColor={dark ? 'gray.700' : 'gray.400'}
        />
      </InputGroup>
      <Label>Master Password</Label>
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
        <Link
          href="/signup"
          textDecoration="underline"
          color={dark ? 'gray.400' : 'gray.700'}
        >
          Sign up
        </Link>
      </Text>
    </AuthPage>
  )
}

export default LoginPage
