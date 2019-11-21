import React from 'react'
import {
  Icon,
  Input,
  InputProps,
  InputGroup,
  InputRightElement,
  IconButton,
  InputLeftElement
} from '@chakra-ui/core'

export interface Props extends InputProps {
  value: string
  onPasswordChange: (password: string) => void
}

const PasswordInput: React.FC<Props> = ({
  value,
  onPasswordChange,
  ...props
}) => {
  const [revealed, setRevealed] = React.useState(false)
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
            onClick={() => setRevealed(!revealed)}
          />
        }
      />
    </InputGroup>
  )
}

export default PasswordInput
