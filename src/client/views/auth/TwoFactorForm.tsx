import React from 'react'
import { Input, Button, useColorMode, Box } from '@chakra-ui/core'
import Label from '../../components/form/Label'
import { Formik, Form, FormikErrors, useField, ErrorMessage } from 'formik'
import ErrorText from '../../components/form/ErrorText'
import theme from '~/src/client/ui/theme'

interface Values {
  twoFactorToken: string
  recoveryToken: string
}

export interface Props {
  onSubmit: (v: Values) => void
}

const TwoFactorTokenField = ({ name, ...props }) => {
  const [field] = useField(name)
  return (
    <>
      <Input
        id={name}
        name={name}
        type="text"
        placeholder="123456"
        mb={1}
        size="lg"
        inputMode="numeric" // Show numeric keyboard on mobile
        pattern="[0-9]{6}"
        textAlign="center"
        fontSize="1.8rem"
        fontFamily={theme.fonts.mono}
        {...field}
        {...props}
      />
      <ErrorMessage name={name} component={ErrorText} />
    </>
  )
}

const TwoFactorForm: React.FC<Props> = ({ onSubmit }) => {
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
        // todo: Add minimal validation
        return errors
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Box mb={4}>
            <Label htmlFor="twoFactorToken">
              Two Factor Authentication Code
            </Label>
            <TwoFactorTokenField name="twoFactorToken" />
          </Box>
          <Button
            type="submit"
            isLoading={isSubmitting}
            width="100%"
            variantColor="blue"
            mt={6}
          >
            Verify
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default TwoFactorForm
