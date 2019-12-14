import {
  encryptString,
  decryptString,
  CloakKey,
  exportCryptoKey
} from './crypto/cloak'
import { b64 } from './crypto/primitives/codec'
import {
  generateSalt,
  deriveAesGcmKeyFromPassword
} from './crypto/primitives/pbkdf2'

export const createMasterKey = async (username: string, password: string) => {
  const masterSalt = b64.encode(generateSalt())
  const masterKey = await deriveMasterKey(username, password, masterSalt)
  return { masterKey, masterSalt }
}

export const deriveMasterKey = async (
  username: string,
  password: string,
  salt: string
): Promise<CloakKey> => {
  const key = await deriveAesGcmKeyFromPassword(
    [username, password].join(':'),
    b64.decode(salt),
    20000
  )
  return await exportCryptoKey(key)
}

// --

export const encryptKeychainKey = async (
  keychainKey: CloakKey,
  masterKey: CloakKey
) => {
  return await encryptString(keychainKey, masterKey)
}

export const decryptKeychainKey = async (
  keychainKey: string,
  masterKey: CloakKey
) => {
  return await decryptString(keychainKey, masterKey)
}
