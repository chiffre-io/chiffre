import React from 'react'
import { CloakKey } from '../engine/crypto/cloak'
import { loadKeychainKey } from '~/src/client/engine/keyStorage'
import useRedirectToLogin from './useRedirectToLogin'

export default function useKeychainKey() {
  const [key, setKey] = React.useState<CloakKey>(null)
  const redirectToLogin = useRedirectToLogin()

  React.useEffect(() => {
    loadKeychainKey().then(loadedKey => {
      if (loadedKey) {
        setKey(loadedKey)
      } else {
        redirectToLogin()
      }
    })
  }, [])

  return key
}
