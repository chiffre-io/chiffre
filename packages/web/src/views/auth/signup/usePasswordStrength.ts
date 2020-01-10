import React from 'react'
import { pwnedPassword } from 'hibp'
import { useDebounce } from 'react-use'
import zxcvbn from 'zxcvbn'
import { PasswordStrength, PASSWORD_MIN_LENGTH } from './passwordSettings'

// --

export default function usePasswordStrength(
  password: string
): PasswordStrength {
  const [pwned, setPwned] = React.useState(0)
  const [strength, setStrength] = React.useState<PasswordStrength>(
    PasswordStrength.empty
  )

  React.useEffect(() => {
    if (password.length === 0) {
      setStrength(PasswordStrength.empty)
      setPwned(0)
      return
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setStrength(PasswordStrength.tooShort)
      setPwned(0)
      return
    }
  }, [password])

  useDebounce(
    () => {
      if (password.length < PASSWORD_MIN_LENGTH) {
        // Don't bother running expensive checks,
        // password won't be accepted anyway.
        return
      }
      const result = zxcvbn(password)
      if (result.score === 4) {
        setStrength(PasswordStrength.strong)
      } else if (result.score === 3) {
        setStrength(PasswordStrength.good)
      } else {
        setStrength(PasswordStrength.weak)
      }
    },
    100,
    [password]
  )

  useDebounce(
    () => {
      if (password.length < PASSWORD_MIN_LENGTH) {
        // Don't bother running expensive checks,
        // password won't be accepted anyway.
        return
      }
      pwnedPassword(password)
        .then(setPwned)
        .catch(console.error)
    },
    500,
    [password]
  )

  if (pwned > 0) {
    return PasswordStrength.pwned
  }
  return strength
}
