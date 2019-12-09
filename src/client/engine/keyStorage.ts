import { CloakKey } from './crypto/cloak'
import { set, get, del } from 'idb-keyval'
import { expirationTimes } from '~/src/shared/config'

interface ExpirableKey {
  key: string
  expiresAt: Date
}

interface MemoryKeyStorage {
  keychainKey: ExpirableKey
}

const memoryKeyStorage: MemoryKeyStorage = {
  keychainKey: null
}

export const saveKeychainKey = async (key: CloakKey, persist: boolean) => {
  memoryKeyStorage.keychainKey = {
    key,
    expiresAt: expirationTimes.inSevenDays()
  }
  if (persist) {
    await set('keys:keychain', memoryKeyStorage.keychainKey)
  }
}

export const loadKeychainKey = async () => {
  if (memoryKeyStorage.keychainKey) {
    if (handleExpiration(memoryKeyStorage.keychainKey)) {
      return null
    }
    return memoryKeyStorage.keychainKey.key
  }
  try {
    const key = await get<ExpirableKey>('keys:keychain')
    if (handleExpiration(key)) {
      return null
    }
    return key.key
  } catch {}
  return null
}

export const deleteKeychainKey = async () => {
  memoryKeyStorage.keychainKey = null
  await del('keys:keychain')
}

// --

const handleExpiration = async (key: ExpirableKey, now = new Date()) => {
  if (key.expiresAt < now) {
    try {
      // Key is expired, revoke it
      await deleteKeychainKey()
    } catch {}
    return true
  }
  return false
}
