import webcrypto from './primitives/webcrypto'
import { utf8, b64, hex } from './primitives/codec'
import { encryptAesGcm, decryptAesGcm } from './primitives/aes-gcm'

export type CloakedString = string
export type Keychain = {
  [fingerprint: string]: string // key
}

export const importKeychain = async (
  encryptedKeychain: string,
  masterKey: string
): Promise<Keychain> => {
  const masterKeychain = {
    [await getKeyFingerprint(masterKey)]: masterKey
  }
  const keyList = await decryptString(encryptedKeychain, masterKeychain)
  const keys = keyList.split(',')
  const keychain: Keychain = {}
  for (const key of keys) {
    keychain[await getKeyFingerprint(key)] = key
  }
  return keychain
}

export const exportKeychain = async (keychain: Keychain, masterKey: string) => {
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
  keys: Keychain
): Promise<string> => {
  if (!input.startsWith('v1.')) {
    throw new Error('Unknown format')
  }
  const [_, algo, fingerprint, iv, ciphertext] = input.split('.')
  if (algo !== 'aesgcm256') {
    throw new Error('Unsupported cipher')
  }
  if (!Object.keys(keys).includes(fingerprint)) {
    throw new Error('Key is not available')
  }
  const key = keys[fingerprint]
  const aesKey = await expandKey(key, 'decrypt')
  return await decryptAesGcm(aesKey, {
    iv: b64.decode(iv),
    text: b64.decode(ciphertext)
  })
}
