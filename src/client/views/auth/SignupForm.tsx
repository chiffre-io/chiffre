import React from 'react'
import dynamic from 'next/dynamic'
import {
  Box,
  Button,
  Text,
  Link,
  Checkbox,
  useColorMode
} from '@chakra-ui/core'
import { Formik, Form, FormikErrors, Field } from 'formik'

import Label, { LabelAside } from '../../components/form/Label'
import EmailField from '../../components/form/EmailField'
import FieldHelpText from '../../components/form/FieldHelpText'
import { ControlledPasswordInput } from '../../components/form/PasswordInput'
import PasswordStrengthSkeleton from './signup/PasswordStrengthSkeleton'
import { RouteLink } from '../../components/Links'
import AboutPasswords from './signup/AboutPasswords'
import Debug from '../../components/form/Debug'
import { PasswordStrength } from './signup/passwordSettings'

const PasswordStrengthIndicator = dynamic(
  () => import('./signup/PasswordStrengthIndicator'),
  { loading: () => <PasswordStrengthSkeleton /> }
)

export interface Values {
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
      return 'gray'
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

const SignupForm: React.FC<Props> = ({ onSubmit }) => {
  const [revealPasswords, setRevealPasswords] = React.useState(false)
  const [aboutPasswordsVisible, setAboutPasswordsVisible] = React.useState(
    false
  )

  const dark = useColorMode().colorMode === 'dark'

  const initialValues: Values = {
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
        if (
          values.passwordConfirmation &&
          values.passwordConfirmation !== values.password
        ) {
          errors.passwordConfirmation = "Passwords don't match"
        }
        return errors
      }}
    >
      {({ values, isSubmitting }) => (
        <Form autoComplete="off">
          <Box mb="4">
            <Label htmlFor="email">Account</Label>
            <FieldHelpText>
              You'll use your email address to log in :
            </FieldHelpText>
            <EmailField />
          </Box>
          <Box mb={4}>
            <Label
              justifyContent="space-between"
              alignItems="center"
              htmlFor="password"
            >
              <span>Master Password</span>
              <LabelAside>
                <Link
                  href="#"
                  onClick={() =>
                    setAboutPasswordsVisible(!aboutPasswordsVisible)
                  }
                >
                  About passwords
                </Link>
              </LabelAside>
            </Label>
            <AboutPasswords revealed={aboutPasswordsVisible} />
            <ControlledPasswordInput
              lockColor={getMainLockColor(values)}
              name="password"
              autoComplete="new-password"
              mb={2}
              revealed={revealPasswords}
              onRevealedChanged={setRevealPasswords}
            />
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
          </Box>
          <Box>
            <Label htmlFor="passwordConfirmation">
              Confirm Master Password
            </Label>
            <ControlledPasswordInput
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
                  <RouteLink to="#todo-url">Terms of Service</RouteLink> and the{' '}
                  <RouteLink to="#todo-url">Privacy Policy</RouteLink>.
                </Text>
              </Checkbox>
            )}
          </Field>
          <Button
            type="submit"
            isLoading={isSubmitting}
            isDisabled={
              !(
                values.passwordStrength >= PasswordStrength.good &&
                values.password === values.passwordConfirmation &&
                values.acceptToS
              )
            }
            width="100%"
            variantColor="green"
            mt={6}
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
          {/* <Debug /> */}
        </Form>
      )}
    </Formik>
  )
}

export default SignupForm
