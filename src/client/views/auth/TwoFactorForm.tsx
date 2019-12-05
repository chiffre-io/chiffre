import React from 'react'
import { Input, Button, Box } from '@chakra-ui/core'
import {
  Formik,
  Form,
  FormikErrors,
  useField,
  ErrorMessage,
  useFormikContext
} from 'formik'
import Label from '~/src/client/components/form/Label'
import ErrorText from '~/src/client/components/form/ErrorText'
import theme from '~/src/client/ui/theme'

export interface Values {
  twoFactorToken: string
  recoveryToken: string
}

const TwoFactorTokenField = ({ name, ...props }) => {
  const [{ onBlur, ...field }] = useField(name)
  return (
    <>
      <Input
        id={name}
        name={name}
        type="text"
        placeholder="123456"
        mb={1}
        size="lg"
        w="9rem"
        inputMode="numeric" // Show numeric keyboard on mobile
        pattern="[0-9]{6}"
        textAlign="center"
        fontSize="1.6rem"
        mx="auto"
        fontFamily={theme.fonts.mono}
        {...field}
        {...props}
      />
      <ErrorMessage name={name} component={ErrorText} />
    </>
  )
}

export interface Props {
  label?: string
  onSubmit: (v: Values) => void
}

const DefaultSubmitButton = ({}) => {
  const ctx = useFormikContext()
  return (
    <Button
      type="submit"
      isLoading={ctx.isSubmitting}
      width="100%"
      variantColor="blue"
      mt={6}
    >
      Verify
    </Button>
  )
}

const TwoFactorForm: React.FC<Props> = ({
  onSubmit,
  label = 'Two-Factor Authentication Code',
  children = <DefaultSubmitButton />
}) => {
  const initialValues: Values = {
    twoFactorToken: '',
    recoveryToken: ''
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={values => {
        const errors: FormikErrors<Values> = {}
        if (values.twoFactorToken.length !== 6) {
          errors.twoFactorToken = 'Token must be 6 digits long'
        }
        return errors
      }}
    >
      {() => (
        <Form>
          <Box mb={4}>
            <Label htmlFor="twoFactorToken">{label}</Label>
            <TwoFactorTokenField name="twoFactorToken" />
          </Box>
          {children}
        </Form>
      )}
    </Formik>
  )
}

export default TwoFactorForm
