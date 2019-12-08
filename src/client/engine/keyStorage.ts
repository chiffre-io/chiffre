import { CloakKey } from './crypto/cloak'
import { set, get, del } from 'idb-keyval'
import { expirationTimes } from '~/src/shared/config'

interface MemoryKeyStorage {
  keychainKey: {
    key: string
    expiresAt: Date
  }
}

const memoryKeyStorage: MemoryKeyStorage = {
  keychainKey: null
}

export const saveKeychainKey = async (key: CloakKey, persist: boolean) => {
  if (persist) {
    await set('keys:keychain', key)
  }
  memoryKeyStorage.keychainKey = {
    key,
    expiresAt: expirationTimes.inSevenDays()
  }
}

export const loadKeychainKey = async () => {
  if (memoryKeyStorage.keychainKey) {
    const now = new Date()
    if (memoryKeyStorage.keychainKey.expiresAt < now) {
      try {
        // Key is expired, revoke it
        await deleteKeychainKey()
      } catch {}
      return null
    }
    return memoryKeyStorage.keychainKey.key
  }
  try {
    const key = await get<string>('keys:keychain')
    if (!key) {
      throw new Error('No key stored in session storage')
    }
    return key
  } catch {}
  return null
}

export const deleteKeychainKey = async () => {
  memoryKeyStorage.keychainKey = null
  await del('keys:keychain')
}
