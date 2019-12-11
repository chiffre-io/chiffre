import { CloakKey } from './crypto/cloak'
import { expirationTimes } from '~/src/shared/config'
import SessionKeystore from 'session-keystore'

type StorableKeys = 'keychain'

const store = new SessionKeystore<StorableKeys>('chiffre')

export const saveKeychainKey = (key: CloakKey, persist: boolean) => {
  const expiresAt = persist ? undefined : expirationTimes.inSevenDays()
  store.set('keychain', key, expiresAt)
}

export const loadKeychainKey = () => {
  return store.get('keychain')
}

export const deleteKeychainKey = async () => {
  store.delete('keychain')
}
