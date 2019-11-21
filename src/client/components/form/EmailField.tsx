import React from 'react'
import {
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useColorMode
} from '@chakra-ui/core'
import { ErrorMessage, useField } from 'formik'
import ErrorText from './ErrorText'

interface Props {
  name?: string
}

const EmailField: React.FC<Props> = ({ name = 'email', ...props }) => {
  const [field] = useField(name)
  const dark = useColorMode().colorMode === 'dark'
  return (
    <>
      <InputGroup>
        <InputLeftElement
          children={
            <Icon name="at-sign" color={dark ? 'gray.600' : 'gray.500'} />
          }
        />
        <Input
          id={name}
          name={name}
          type="email"
          placeholder="email address"
          mb={1}
          {...field}
          {...props}
        />
      </InputGroup>
      <ErrorMessage name={name} component={ErrorText} />
    </>
  )
}

export default EmailField
