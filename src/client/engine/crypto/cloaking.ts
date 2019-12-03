import webcrypto from './primitives/webcrypto'
import { utf8, b64, hex } from './primitives/codec'
import { encryptAesGcm, decryptAesGcm } from './primitives/aes-gcm'

export type CloakedString = string
export type CloakKey = string
export type Keychain = {
  [fingerprint: string]: CloakKey // key
}

export const makeKeychain = async (keys: CloakKey[]): Promise<Keychain> => {
  const keychain: Keychain = {}
  for (const key of keys) {
    keychain[await getKeyFingerprint(key)] = key
  }
  return keychain
}

/**
 * Decrypt and hydrate the given encrypted keychain
 *
 * @param encryptedKeychain - A keychain as exported by exportKeychain
 * @param masterKey - The key used to encrypt the keychain
 */
export const importKeychain = async (
  encryptedKeychain: CloakedString,
  masterKey: CloakKey
): Promise<Keychain> => {
  const keyList = await decryptString(encryptedKeychain, masterKey)
  const keys = keyList.split(',')
  const keychain: Keychain = {}
  for (const key of keys) {
    keychain[await getKeyFingerprint(key)] = key
  }
  return keychain
}

/**
 * Export a serialized and encrypted version of a keychain
 *
 * @param keychain - The keychain to export
 * @param masterKey The key to use to encrypt the keychain
 * @returns an encrypted keychain string
 */
export const exportKeychain = async (
  keychain: Keychain,
  masterKey: CloakKey
): Promise<CloakedString> => {
  const keyList = Object.values(keychain).join(',')
  return encryptString(keyList, masterKey)
}

export const generateKey = async () => {
  const key = await webcrypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  )
  return await exportCryptoKey(key)
}

export const exportCryptoKey = async (key: CryptoKey) => {
  const raw = await webcrypto.subtle.exportKey('raw', key)
  return b64.encode(new Uint8Array(raw))
}

export const expandKey = async (key: string, usage: 'encrypt' | 'decrypt') => {
  const raw = b64.decode(key)
  return await webcrypto.subtle.importKey(
    'raw',
    raw,
    {
      name: 'AES-GCM',
      length: 256
    },
    false, // Cannot re-export
    [usage]
  )
}

export const getKeyFingerprint = async (key: string): Promise<string> => {
  const data = utf8.encode(key)
  const hash = await webcrypto.subtle.digest('SHA-256', data)
  return hex.encode(new Uint8Array(hash)).slice(0, 8)
}

export const encryptString = async (
  input: string,
  key: string
): Promise<CloakedString> => {
  const aesKey = await expandKey(key, 'encrypt')
  const fingerprint = await getKeyFingerprint(key)
  const { text: ciphertext, iv } = await encryptAesGcm(aesKey, input)
  return [
    'v1',
    'aesgcm256',
    fingerprint,
    b64.encode(iv),
    b64.encode(ciphertext)
  ].join('.')
}

export const decryptString = async (
  input: CloakedString,
  key: CloakKey
): Promise<string> => {
  if (!input.startsWith('v1.')) {
    throw new Error('Unknown format')
  }
  const [_, algo, fingerprint, iv, ciphertext] = input.split('.')
  if (algo !== 'aesgcm256') {
    throw new Error('Unsupported cipher')
  }
  const aesKey = await expandKey(key, 'decrypt')
  return await decryptAesGcm(aesKey, {
    iv: b64.decode(iv),
    text: b64.decode(ciphertext)
  })
}

export const findKeyForMessage = async (
  message: CloakedString,
  keychain: Keychain
): Promise<CloakKey> => {
  if (!message.startsWith('v1.')) {
    throw new Error('Unknown format')
  }
  const [_, algo, fingerprint] = message.split('.')
  if (algo !== 'aesgcm256') {
    throw new Error('Unsupported cipher')
  }
  if (!Object.keys(keychain).includes(fingerprint)) {
    throw new Error('Key is not available')
  }
  return keychain[fingerprint]
}

// export const decryptString = async (
//   input: CloakedString,
//   keys: Keychain
// ): Promise<string> => {
//   if (!input.startsWith('v1.')) {
//     throw new Error('Unknown format')
//   }
//   const [_, algo, fingerprint, iv, ciphertext] = input.split('.')
//   if (algo !== 'aesgcm256') {
//     throw new Error('Unsupported cipher')
//   }
//   if (!Object.keys(keys).includes(fingerprint)) {
//     throw new Error('Key is not available')
//   }
//   const key = keys[fingerprint]
//   const aesKey = await expandKey(key, 'decrypt')
//   return await decryptAesGcm(aesKey, {
//     iv: b64.decode(iv),
//     text: b64.decode(ciphertext)
//   })
// }
