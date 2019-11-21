import React from 'react'
import {
  Icon,
  Input,
  InputProps,
  InputGroup,
  InputRightElement,
  IconButton,
  InputLeftElement,
  useColorMode
} from '@chakra-ui/core'
import { useField, ErrorMessage } from 'formik'
import ErrorText from './ErrorText'

export interface ControlledProps extends InputProps {
  lockColor?: string
  revealed: boolean
  onRevealedChanged: (revealed: boolean) => void
}

/**
 * Password input with external state
 * for the clear text reveal feature.
 */
export const ControlledPasswordInput: React.FC<ControlledProps> = ({
  lockColor = 'gray',
  revealed = false,
  onRevealedChanged,
  ...props
}) => {
  const dark = useColorMode().colorMode === 'dark'
  const [field] = useField(props.name)
  return (
    <>
      <InputGroup>
        <InputLeftElement
          children={
            <Icon name="lock" color={`${lockColor}.${dark ? 600 : 500}`} />
          }
        />
        <Input
          id={field.name}
          fontFamily={
            revealed && field.value.length > 0 ? 'monospace' : 'inherit'
          }
          type={revealed ? 'text' : 'password'}
          placeholder="password"
          pr={8}
          mb={2}
          {...field}
          {...props}
        />
        <InputRightElement
          children={
            <IconButton
              aria-label={revealed ? 'Hide password' : 'Show password'}
              icon={revealed ? 'view-off' : 'view'}
              variant="ghost"
              _hover={{
                color: dark ? 'gray.500' : 'gray.600',
                backgroundColor: 'transparent'
              }}
              _pressed={{
                color: dark ? 'gray.400' : 'gray.700',
                backgroundColor: 'transparent'
              }}
              _active={{
                color: dark ? 'gray.400' : 'gray.700',
                backgroundColor: 'transparent'
              }}
              color={dark ? 'gray.600' : 'gray.500'}
              onClick={() => onRevealedChanged(!revealed)}
            />
          }
        />
      </InputGroup>
      <ErrorMessage component={ErrorText} name={field.name} />
    </>
  )
}

/**
 * Password input with internal state
 * for the clear text reveal feature.
 */
const PasswordInput: React.FC<InputProps> = ({ ...props }) => {
  const [revealed, setRevealed] = React.useState(false)

  return (
    <ControlledPasswordInput
      revealed={revealed}
      onRevealedChanged={setRevealed}
      {...props}
    />
  )
}

export default PasswordInput
