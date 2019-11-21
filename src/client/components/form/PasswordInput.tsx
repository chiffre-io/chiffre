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

export interface Props extends InputProps {
  value: string
  onPasswordChange: (password: string) => void
}

export interface ControlledProps extends Props {
  revealed: boolean
  onRevealedChanged: (revealed: boolean) => void
}

/**
 * Password input with external state
 * for the clear text reveal feature.
 */
export const ControlledPasswordInput: React.FC<ControlledProps> = ({
  value,
  onPasswordChange,
  revealed = false,
  onRevealedChanged,
  ...props
}) => {
  const dark = useColorMode().colorMode === 'dark'

  return (
    <InputGroup>
      <InputLeftElement children={<Icon name="lock" color="gray.500" />} />
      <Input
        value={value}
        fontFamily={revealed && value.length > 0 ? 'monospace' : 'inherit'}
        onChange={e => onPasswordChange(e.target.value)}
        type={revealed ? 'text' : 'password'}
        placeholder="password"
        pr={8}
        mb={2}
        _placeholder={{
          color: 'gray.500'
        }}
        borderColor={dark ? 'gray.700' : 'gray.400'}
        // letterSpacing={value.length > 0 ? '0.05em' : 'auto'}
        {...props}
      />
      <InputRightElement
        children={
          <IconButton
            aria-label={revealed ? 'Hide password' : 'Show password'}
            icon={revealed ? 'view-off' : 'view'}
            variant="ghost"
            _hover={{
              color: 'gray.600',
              backgroundColor: 'transparent'
            }}
            _pressed={{
              color: 'gray.700',
              backgroundColor: 'transparent'
            }}
            _active={{
              color: 'gray.700',
              backgroundColor: 'transparent'
            }}
            color="gray.500"
            onClick={() => onRevealedChanged(!revealed)}
          />
        }
      />
      )
    </InputGroup>
  )
}

/**
 * Password input with internal state
 * for the clear text reveal feature.
 */
const PasswordInput: React.FC<Props> = ({
  value,
  onPasswordChange,
  ...props
}) => {
  const [revealed, setRevealed] = React.useState(false)

  return (
    <ControlledPasswordInput
      value={value}
      onPasswordChange={onPasswordChange}
      revealed={revealed}
      onRevealedChanged={setRevealed}
      {...props}
    />
  )
}

export default PasswordInput
