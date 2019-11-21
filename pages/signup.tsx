import React from 'react'
import dynamic from 'next/dynamic'
import {
  Input,
  Button,
  Text,
  Link,
  Collapse,
  InputGroup,
  InputLeftElement,
  Icon,
  Checkbox,
  useColorMode
} from '@chakra-ui/core'
import AuthPage from '../src/client/components/auth/AuthPage'
import PasswordInput from '../src/client/components/PasswordInput'
import Label, { LabelAside } from '../src/client/components/form/Label'
import PasswordStrengthSkeleton from '../src/client/components/PasswordStrengthSkeleton'

const PasswordStrengthIndicator = dynamic(
  () => import('../src/client/components/PasswordStrengthIndicator'),
  { loading: () => <PasswordStrengthSkeleton /> }
)

const Paragraph = ({ children, ...props }) => {
  const dark = useColorMode().colorMode === 'dark'
  return (
    <Text
      fontSize="sm"
      color={dark ? 'gray.500' : 'gray.700'}
      mb={2}
      {...props}
    >
      {children}
    </Text>
  )
}

const AboutPasswords = ({ revealed }) => {
  return (
    <Collapse isOpen={revealed}>
      <Paragraph>Your master password is the key to your account.</Paragraph>
      <Paragraph>
        It is not sent to us, so we have <b>no way</b> to reset it for you.
      </Paragraph>
      <Paragraph>
        We recommend you use a secure password manager to generate a long and
        complex password*, and store it there.
      </Paragraph>
      <Paragraph>
        Learn more about our{' '}
        <Link textDecoration="underline" href="#todo-url">
          security policy
        </Link>
        .
      </Paragraph>
      <Paragraph mb={4}>
        * <i>Recommended : 64+ characters of all sorts</i>
      </Paragraph>
    </Collapse>
  )
}

const SignupPage = () => {
  const [password, setPassword] = React.useState('')
  const [aboutPasswordsVisible, setAboutPasswordsVisible] = React.useState(
    false
  )

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
      <Label justifyContent="space-between" alignItems="center">
        <span>Master Password</span>
        <LabelAside>
          <Link
            href="#"
            onClick={() => setAboutPasswordsVisible(!aboutPasswordsVisible)}
          >
            About passwords
          </Link>
        </LabelAside>
      </Label>
      <AboutPasswords revealed={aboutPasswordsVisible} />
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

      <Checkbox pt={4} variantColor="green">
        <Text fontSize="xs" color={dark ? 'gray.500' : 'gray.600'}>
          I accept the{' '}
          <Link textDecoration="underline" href="#todo-url">
            Terms &amp; Conditions
          </Link>{' '}
          and the{' '}
          <Link textDecoration="underline" href="#todo-url">
            Privacy Policy
          </Link>
          .
        </Text>
      </Checkbox>
      <Button width="100%" variantColor="green" mt={6}>
        Create account
      </Button>
      <Text
        textAlign="center"
        mt={4}
        fontSize="sm"
        color={dark ? 'gray.500' : 'gray.600'}
      >
        Already have an account ?{' '}
        <Link
          href="/login"
          textDecoration="underline"
          color={dark ? 'gray.400' : 'gray.700'}
        >
          Sign in
        </Link>
      </Text>
    </AuthPage>
  )
}

export default SignupPage
