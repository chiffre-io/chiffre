import { CloakKey } from '@47ng/cloak'
import { expirationTimes } from '~/src/shared/config'
import SessionKeystore from 'session-keystore'

type StorableKeys = 'keychain' | 'signature' | 'sharing'

const store = new SessionKeystore<StorableKeys>({ name: 'chiffre' })

export const saveKey = (keyName: StorableKeys, key: CloakKey) => {
  store.set(keyName, key, expirationTimes.inSevenDays())
}

export const loadKey = (keyName: StorableKeys) => {
  return store.get(keyName)
}

export const clearKeys = () => {
  store.clear()
}
