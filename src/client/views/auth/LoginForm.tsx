import React from 'react'
import {
  Input,
  Button,
  useColorMode,
  InputGroup,
  InputLeftElement,
  Icon,
  Text,
  Box
} from '@chakra-ui/core'
import PasswordField from '~/src/client/components/form/PasswordField'
import Label from '~/src/client/components/form/Label'
import { RouteLink } from '~/src/client/components/Links'
import EmailField from '~/src/client/components/form/EmailField'
import { Formik, Form, FormikErrors } from 'formik'

interface Values {
  email: string
  password: string
}

export interface Props {
  onSubmit: (v: Values) => void
}

const LoginForm: React.FC<Props> = ({ onSubmit }) => {
  const dark = useColorMode().colorMode === 'dark'

  const initialValues: Values = {
    email: '',
    password: ''
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
          <Box mb={4}>
            <Label htmlFor="email">Account</Label>
            <EmailField />
          </Box>
          <Box mb={4}>
            <Label htmlFor="password">Master Password</Label>
            <PasswordField name="password" />
          </Box>
          <Button
            type="submit"
            isLoading={isSubmitting}
            width="100%"
            variantColor="blue"
            mt={6}
          >
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
        </Form>
      )}
    </Formik>
  )
}

export default LoginForm
