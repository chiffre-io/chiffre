import React from 'react'
import {
  Box,
  Button,
  Text,
  Checkbox,
  useColorMode,
  useToast,
  useToastOptions
} from '@chakra-ui/core'
import { Formik, Form, FormikErrors, Field, ErrorMessage } from 'formik'

import Label, { LabelWithAside } from '../../components/form/Label'
import EmailField from '../../components/form/EmailField'
import InputField from '../../components/form/InputField'
import FieldHelpText from '../../components/form/FieldHelpText'
import { ControlledPasswordField } from '../../components/form/PasswordField'
import PasswordStrengthIndicator from './signup/PasswordStrengthIndicator'
import { RouteLink } from '../../components/primitives/Links'
import AboutPasswords from './signup/AboutPasswords'
import { PasswordStrength } from './signup/passwordSettings'
import ErrorText from '../../components/form/ErrorText'
import useQueryString from '../../hooks/useQueryString'

export interface Values {
  name: string
  email: string
  password: string
  passwordConfirmation: string
  passwordStrength: PasswordStrength
  acceptToS: boolean
}

export interface Props {
  onSubmit: (values: Values) => void
}

const getMainLockColor = (values: Values) => {
  switch (values.passwordStrength) {
    case PasswordStrength.good:
    case PasswordStrength.strong:
      return 'green'
    case PasswordStrength.pwned:
      return 'red'
    default:
      return undefined
  }
}

const getConfirmationLockColor = (values: Values) => {
  if (values.passwordStrength === PasswordStrength.pwned) {
    return 'red'
  }
  const { password, passwordConfirmation } = values
  if (values.passwordStrength < PasswordStrength.good) {
    return 'gray'
  }
  if (password.length > 0 && passwordConfirmation.length > 0) {
    return password === passwordConfirmation ? 'green' : 'red'
  }
  return 'gray'
}

const showToast = (
  toast: (props: useToastOptions) => void,
  errors: FormikErrors<Values>
) => {
  if (errors.passwordStrength) {
    toast({
      title: 'Invalid password',
      description: errors.passwordStrength,
      status: 'error',
      isClosable: true
    })
  }
}

const MasterPasswordLabel = () => {
  const [aboutPasswordsVisible, setAboutPasswordsVisible] = React.useState(
    false
  )
  const aboutPwdRef = React.useRef<HTMLElement>()
  return (
    <>
      <LabelWithAside
        ref={aboutPwdRef}
        justifyContent="space-between"
        alignItems="center"
        htmlFor="password"
        aside={() => (
          <RouteLink
            to={aboutPasswordsVisible ? '' : '#about-passwords'}
            onClick={() => {
              setAboutPasswordsVisible(!aboutPasswordsVisible)
              aboutPwdRef.current.scrollIntoView({
                behavior: 'smooth'
              })
            }}
          >
            About passwords
          </RouteLink>
        )}
      >
        Master Password
      </LabelWithAside>
      <AboutPasswords revealed={aboutPasswordsVisible} />
    </>
  )
}

// --

const SignupForm: React.FC<Props> = ({ onSubmit }) => {
  const [revealPasswords, setRevealPasswords] = React.useState(false)
  const toast = useToast()
  const dark = useColorMode().colorMode === 'dark'

  const redirectQuery = useQueryString('redirect')
  const loginUrl = `/login${redirectQuery ? '?redirect=' + redirectQuery : ''}`

  const initialValues: Values = {
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    passwordStrength: PasswordStrength.empty,
    acceptToS: false
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={values => {
        const errors: FormikErrors<Values> = {}
        if (!values.email) {
          errors.email = 'Email address is required'
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
        ) {
          errors.email = 'Invalid email address'
        }
        if (values.passwordStrength < PasswordStrength.good) {
          errors.passwordStrength = 'Please use a stronger password'
        }
        if (values.passwordStrength === PasswordStrength.pwned) {
          errors.passwordStrength = 'Please use a secure password'
        }
        if (values.password.length === 0) {
          errors.password = 'Password is required'
        }

        if (
          values.passwordConfirmation &&
          values.passwordConfirmation !== values.password
        ) {
          errors.passwordConfirmation = "Passwords don't match"
        }
        if (!values.acceptToS) {
          errors.acceptToS = 'Please read and accept our terms'
        }
        return errors
      }}
    >
      {({ values, errors, isSubmitting }) => (
        <Form autoComplete="off">
          <Box mb="4">
            <LabelWithAside
              htmlFor="email"
              aside={() => (
                <FieldHelpText id="email-help-text" fontSize="xs">
                  You'll use your email address to log in
                </FieldHelpText>
              )}
            >
              Account
            </LabelWithAside>
            <EmailField aria-describedby="email-help-text" colorValidation />
          </Box>
          <Box mb="4">
            <LabelWithAside
              htmlFor="name"
              aside={() => (
                <FieldHelpText id="name-help-text" fontSize="xs">
                  What shall we call you ?
                </FieldHelpText>
              )}
            >
              Display Name
            </LabelWithAside>
            <InputField
              name="name"
              aria-describedby="name-help-text"
              placeholder="enter your name"
            />
          </Box>
          <Box mb={4}>
            <MasterPasswordLabel />
            <ControlledPasswordField
              lockColor={getMainLockColor(values)}
              name="password"
              autoComplete="new-password"
              mb={2}
              revealed={revealPasswords}
              onRevealedChanged={setRevealPasswords}
            >
              <Field name="passwordStrength">
                {({ field, form }) => (
                  <PasswordStrengthIndicator
                    password={values.password}
                    onStrengthChange={strength =>
                      form.setFieldValue(field.name, strength, true)
                    }
                  />
                )}
              </Field>
            </ControlledPasswordField>
          </Box>
          <Box>
            <Label htmlFor="passwordConfirmation">
              Confirm Master Password
            </Label>
            <ControlledPasswordField
              lockColor={getConfirmationLockColor(values)}
              name="passwordConfirmation"
              autoComplete="new-password"
              placeholder="confirm password"
              revealed={revealPasswords}
              onRevealedChanged={setRevealPasswords}
            />
          </Box>
          <Field name="acceptToS">
            {({ field }) => (
              <Checkbox pt={4} variantColor="green" {...field}>
                <Text fontSize="sm">
                  I accept the{' '}
                  <RouteLink
                    to="/legal/terms-of-service"
                    textDecoration="underline"
                  >
                    Terms of Service
                  </RouteLink>{' '}
                  and the{' '}
                  <RouteLink
                    to="/legal/privacy-policy"
                    textDecoration="underline"
                  >
                    Privacy Policy
                  </RouteLink>
                  .
                </Text>
              </Checkbox>
            )}
          </Field>
          <ErrorMessage component={ErrorText} name="acceptToS" />
          <Button
            type="submit"
            isLoading={isSubmitting}
            width="100%"
            variantColor="green"
            mt={6}
            onClick={() => showToast(toast, errors)}
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
            <RouteLink
              to={loginUrl}
              color={dark ? 'gray.400' : 'gray.700'}
              textDecoration="underline"
            >
              Sign in
            </RouteLink>
          </Text>
        </Form>
      )}
    </Formik>
  )
}

export default SignupForm
