import React from 'react'
import {
  Input,
  InputProps,
  InputGroup,
  InputRightElement,
  Icon,
  IconButton
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
      <Input
        value={value}
        fontFamily={revealed && value.length > 0 ? 'monospace' : 'inherit'}
        onChange={e => onPasswordChange(e.target.value)}
        type={revealed ? 'text' : 'password'}
        placeholder="password"
        {...props}
      />
      <InputRightElement
        children={
          <IconButton
            aria-label="Show/hide password"
            icon="view"
            variant="link"
            color="gray.500"
            onClick={() => setRevealed(!revealed)}
          />
        }
      />
    </InputGroup>
  )
}

export default PasswordInput
