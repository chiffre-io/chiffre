import React from 'react'
import {
  Input,
  InputProps,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorMode,
  Icon,
  InputLeftElement
} from '@chakra-ui/core'
import { useField, ErrorMessage } from 'formik'
import ErrorText from './ErrorText'
import { ThemeableColors } from '../../ui/colors'
import { leftIconColors } from './formIcons'
import theme from '../../ui/theme'

// --

export interface Props extends InputProps {
  lockColor?: keyof ThemeableColors
}

export interface ControlledProps extends Props {
  revealed: boolean
  onRevealedChanged: (revealed: boolean) => void
}

/**
 * Password input with external state
 * for the clear text reveal feature.
 */
export const ControlledPasswordField: React.FC<ControlledProps> = ({
  lockColor = 'gray',
  revealed = false,
  onRevealedChanged,
  children,
  ...props
}) => {
  const dark = useColorMode().colorMode === 'dark'
  const [{ onBlur: _, ...field }] = useField(props.name)
  return (
    <>
      <InputGroup>
        <InputLeftElement
          children={
            <Icon
              name="lock"
              color={
                dark
                  ? leftIconColors[lockColor].dark
                  : leftIconColors[lockColor].light
              }
            />
          }
        />
        <Input
          id={field.name}
          fontFamily={
            revealed && field.value.length > 0 ? theme.fonts.mono : 'inherit'
          }
          transition="border 0.2s ease"
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
      {children}
      <ErrorMessage component={ErrorText} name={field.name} />
    </>
  )
}

/**
 * Password input with internal state
 * for the clear text reveal feature.
 */
const PasswordField: React.FC<Props> = ({ ...props }) => {
  const [revealed, setRevealed] = React.useState(false)
  return (
    <ControlledPasswordField
      revealed={revealed}
      onRevealedChanged={setRevealed}
      {...props}
    />
  )
}

export default PasswordField
