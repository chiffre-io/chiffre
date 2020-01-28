import React from 'react'
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  Icon,
  useColorMode
} from '@chakra-ui/core'
import { ErrorMessage, useField, FieldMetaProps } from 'formik'
import ErrorText from './ErrorText'
import { leftIconColors } from './formIcons'

// --

const getAtSignColor = (meta: FieldMetaProps<string>) => {
  if (!meta.touched) {
    if (meta.value.length === 0) {
      return 'gray'
    }
    // There is some text
    if (!meta.error) {
      return 'green'
    }
    // But it's not valid yet
    return 'gray'
  }
  if (meta.error || meta.value.length === 0) {
    return 'red'
  }
  return 'green'
}

// --

interface Props extends InputProps {
  colorValidation?: boolean
  name?: string
}

const EmailField: React.FC<Props> = ({
  colorValidation = false,
  name = 'email',
  ...props
}) => {
  const [{ onBlur: _, ...field }, meta] = useField(name)
  const dark = useColorMode().colorMode === 'dark'
  const atSignColor = colorValidation ? getAtSignColor(meta) : 'gray'
  return (
    <>
      <InputGroup>
        <InputLeftElement
          children={
            <Icon
              name="at-sign"
              color={
                dark
                  ? leftIconColors[atSignColor].dark
                  : leftIconColors[atSignColor].light
              }
            />
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
