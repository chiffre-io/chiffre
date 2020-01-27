import React from 'react'
import { Input, InputProps } from '@chakra-ui/core'
import { ErrorMessage, useField } from 'formik'
import ErrorText from './ErrorText'

// --

interface Props extends InputProps {
  name: string
}

const InputField: React.FC<Props> = ({ name, ...props }) => {
  const [{ onBlur: _, ...field }, meta] = useField(name)
  return (
    <>
      <Input id={name} name={name} type="text" mb={1} {...field} {...props} />
      <ErrorMessage name={name} component={ErrorText} />
    </>
  )
}

export default InputField
