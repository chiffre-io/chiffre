import { CloakKey } from '@47ng/cloak'
import SessionKeystore from 'session-keystore'

export const expirationTimes = {
  inSevenDays: (now = new Date()): Date =>
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  inFiveMinutes: (now = new Date()): Date =>
    new Date(now.getTime() + 5 * 60 * 1000)
}

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
