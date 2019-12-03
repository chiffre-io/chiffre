import React from 'react'
import { Input } from '@chakra-ui/core'
import { useField, ErrorMessage } from 'formik'
import ErrorText from './ErrorText'
import theme from '~/src/client/ui/theme'

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

export default TwoFactorTokenField
