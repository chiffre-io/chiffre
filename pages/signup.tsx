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
import { RouteLink } from '../src/client/components/Links'

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

const HelpText = ({ children }) => {
  const dark = useColorMode().colorMode === 'dark'
  return (
    <Text fontSize="sm" color={dark ? 'gray.400' : 'gray.600'} mb={4}>
      {children}
    </Text>
  )
}

const AboutPasswords = ({ revealed }) => {
  return (
    <Collapse isOpen={revealed}>
      <Paragraph>Your master password is the key to your account.</Paragraph>
      <Paragraph>
        It is never sent to us, so we have{' '}
        <Text as="span" fontWeight="semibold">
          no way
        </Text>{' '}
        to reset it for you.
      </Paragraph>
      <Paragraph>
        We recommend you use a secure password manager to generate a long and
        complex password*, and store it there.
      </Paragraph>
      <Paragraph>
        Learn more about our{' '}
        <RouteLink to="#todo-url">Security Policy</RouteLink>.
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
      <form autoComplete="off">
        <Label htmlFor="email">Account</Label>
        <InputGroup>
          <InputLeftElement
            children={<Icon name="at-sign" color="gray.500" />}
          />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email address"
            _placeholder={{
              color: 'gray.500'
            }}
            mb={1}
            borderColor={dark ? 'gray.700' : 'gray.400'}
          />
        </InputGroup>
        <HelpText>You'll use your email address to log in.</HelpText>
        <Label
          justifyContent="space-between"
          alignItems="center"
          htmlFor="password"
        >
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
          id="password"
          name="password"
          autoComplete="new-password"
          onPasswordChange={setPassword}
          value={password}
          mb={2}
          _placeholder={{
            color: 'gray.500'
          }}
          borderColor={dark ? 'gray.700' : 'gray.400'}
          letterSpacing={password.length > 0 ? '0.05em' : 'auto'}
        />
        <PasswordStrengthIndicator password={password} mb={4} />
        <Label htmlFor="passwordConfirm">Confirm Master Password</Label>
        <PasswordInput
          id="passwordConfirm"
          name="passwordConfirm"
          autoComplete="new-password"
          onPasswordChange={setPassword}
          value={password}
          mb={2}
          _placeholder={{
            color: 'gray.500'
          }}
          borderColor={dark ? 'gray.700' : 'gray.400'}
          letterSpacing={password.length > 0 ? '0.05em' : 'auto'}
        />

        <Checkbox pt={4} variantColor="green">
          <Text fontSize="sm">
            I accept the <RouteLink to="#todo-url">Terms of Service</RouteLink>{' '}
            and the <RouteLink to="#todo-url">Privacy Policy</RouteLink>.
          </Text>
        </Checkbox>
        <Button
          width="100%"
          variantColor="green"
          mt={6}
          // isLoading
          // loadingText="Generating keys..."
        >
          Create account
        </Button>
        <Text
          textAlign="center"
          mt={4}
          fontSize="sm"
          color={dark ? 'gray.500' : 'gray.600'}
        >
          Already have an account ?{' '}
          <RouteLink to="/login" color={dark ? 'gray.400' : 'gray.700'}>
            Sign in
          </RouteLink>
        </Text>
      </form>
    </AuthPage>
  )
}

export default SignupPage
