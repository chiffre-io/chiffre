import React from 'react'
import {
  Button,
  useColorMode,
  Text,
  Box,
  Stack,
  Checkbox,
  Flex,
  Link,
  Icon,
  Collapse
} from '@chakra-ui/core'
import PasswordField from '~/src/client/components/form/PasswordField'
import Label from '~/src/client/components/form/Label'
import { RouteLink } from '~/src/client/components/Links'
import EmailField from '~/src/client/components/form/EmailField'
import { Formik, Form, FormikErrors, Field } from 'formik'
import useQueryString from '~/src/client/hooks/useQueryString'

interface Values {
  email: string
  password: string
  rememberMe: boolean
}

export interface Props {
  onSubmit: (v: Values) => void
}

const LoginForm: React.FC<Props> = ({ onSubmit }) => {
  const dark = useColorMode().colorMode === 'dark'
  const [aboutRememberMeVisible, setAboutRememberMeVisible] = React.useState(
    false
  )

  const redirectQuery = useQueryString('redirect')
  const signupUrl = `/signup${
    redirectQuery ? '?redirect=' + redirectQuery : ''
  }`

  const initialValues: Values = {
    email: '',
    password: '',
    rememberMe: false
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
        if (values.password.length === 0) {
          errors.password = 'Password is required'
        }
        return errors
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Stack spacing={4}>
            <Box>
              <Label htmlFor="email">Account</Label>
              <EmailField />
            </Box>
            <Box>
              <Label htmlFor="password">Master Password</Label>
              <PasswordField name="password" />
            </Box>
            <Flex justifyContent="space-between" alignItems="baseline">
              <Field name="rememberMe">
                {({ field }) => (
                  <Checkbox size="sm" {...field}>
                    Remember me on this device
                  </Checkbox>
                )}
              </Field>
              <Link
                fontSize="sm"
                color="gray.500"
                href={aboutRememberMeVisible ? '#about-remember-me' : '#'}
                onClick={() => setAboutRememberMeVisible(state => !state)}
              >
                <Icon name="question" />
              </Link>
            </Flex>
            <Collapse isOpen={aboutRememberMeVisible} fontSize="sm">
              "Remember me" will save your master key on this device.
              <br />
              If your password is hard to remember or to type, we recommend you
              use a secure password manager.
              <br />
              Learn more about our{' '}
              <RouteLink href="/legal/security-policy">
                Security Policy
              </RouteLink>
              .
            </Collapse>
            <Button
              type="submit"
              isLoading={isSubmitting}
              width="100%"
              variantColor="blue"
              mt={2}
            >
              Sign in to your account
            </Button>
            <Text
              textAlign="center"
              fontSize="sm"
              color={dark ? 'gray.500' : 'gray.600'}
            >
              Don't have an account ?{' '}
              <RouteLink
                href={signupUrl}
                color={dark ? 'gray.400' : 'gray.700'}
              >
                Sign up
              </RouteLink>
            </Text>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}

export default LoginForm
