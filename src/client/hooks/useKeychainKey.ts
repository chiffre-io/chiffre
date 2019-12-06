import React from 'react'
import { CloakKey } from '../engine/crypto/cloak'
import keyStorage from '~/src/client/engine/keyStorage'
import useRedirectToLogin from './useRedirectToLogin'

export default function useKeychainKey() {
  const [key, setKey] = React.useState<CloakKey>(null)
  const redirectToLogin = useRedirectToLogin()

  React.useEffect(() => {
    const storedKey = keyStorage.keychainKey
    if (storedKey) {
      setKey(storedKey)
    } else {
      redirectToLogin()
    }
  }, [])

  return key
}
