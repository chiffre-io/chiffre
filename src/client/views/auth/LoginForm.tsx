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
import PasswordInput from '../../components/form/PasswordInput'
import Label from '../../components/form/Label'
import { RouteLink } from '../../components/Links'
import EmailField from '../../components/form/EmailField'
import { Formik, Form } from 'formik'

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
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ values, isSubmitting }) => (
        <Form>
          <Box mb={4}>
            <Label htmlFor="email">Account</Label>
            <EmailField />
          </Box>
          <Box mb={4}>
            <Label htmlFor="password">Master Password</Label>
            <PasswordInput name="password" />
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
