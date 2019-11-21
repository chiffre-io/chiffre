import React from 'react'
import dynamic from 'next/dynamic'
import {
  Input,
  Button,
  Text,
  Link,
  InputGroup,
  InputLeftElement,
  Icon,
  Checkbox,
  useColorMode
} from '@chakra-ui/core'
import { ControlledPasswordInput } from '../../components/form/PasswordInput'
import Label, { LabelAside } from '../../components/form/Label'
import PasswordStrengthSkeleton from './signup/PasswordStrengthSkeleton'
import { RouteLink } from '../../components/Links'
import AboutPasswords from './signup/AboutPasswords'

const PasswordStrengthIndicator = dynamic(
  () => import('./signup/PasswordStrengthIndicator'),
  { loading: () => <PasswordStrengthSkeleton /> }
)

export interface Values {
  email: string
  password: string
  passwordConfirm: string
  acceptToS: boolean
}

export interface Props {
  onSubmit: (values: Values) => void
}

const HelpText = ({ children }) => {
  const dark = useColorMode().colorMode === 'dark'
  return (
    <Text fontSize="sm" color={dark ? 'gray.400' : 'gray.600'} mb={4}>
      {children}
    </Text>
  )
}

const SignupForm: React.FC<Props> = ({ onSubmit }) => {
  const [password, setPassword] = React.useState('')
  const [revealPasswords, setRevealPasswords] = React.useState(false)
  const [aboutPasswordsVisible, setAboutPasswordsVisible] = React.useState(
    false
  )

  const dark = useColorMode().colorMode === 'dark'

  return (
    <form autoComplete="off">
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
      <ControlledPasswordInput
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
        revealed={revealPasswords}
        onRevealedChanged={setRevealPasswords}
      />
      <PasswordStrengthIndicator password={password} mb={4} />
      <Label htmlFor="passwordConfirm">Confirm Master Password</Label>
      <ControlledPasswordInput
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
        revealed={revealPasswords}
        onRevealedChanged={setRevealPasswords}
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
  )
}

export default SignupForm
