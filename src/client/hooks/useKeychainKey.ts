import React from 'react'
import { CloakKey } from '@47ng/cloak'
import { loadKey } from '~/src/client/engine/keyStorage'
import useRedirectToLogin from './useRedirectToLogin'

export default function useKeychainKey() {
  const [key, setKey] = React.useState<CloakKey>(null)
  const redirectToLogin = useRedirectToLogin()

  React.useEffect(() => {
    const loadedKey = loadKey('keychain')
    if (loadedKey) {
      setKey(loadedKey)
    } else {
      redirectToLogin()
    }
  }, [])

  return key
}
