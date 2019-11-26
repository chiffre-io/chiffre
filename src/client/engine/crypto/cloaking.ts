import webcrypto from './primitives/webcrypto'
import { utf8, b64 } from './primitives/codec'
import { encryptAesGcm, decryptAesGcm } from './primitives/aes-gcm'

export type CloakedString = string

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
  return b64.encode(Buffer.from(raw))
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
  return Buffer.from(hash)
    .toString('hex')
    .slice(0, 8)
    .toLowerCase()
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
  keys: { [fingerprint: string]: string }
): Promise<string> => {
  if (!input.startsWith('v1.')) {
    throw new Error('Unknown format')
  }
  const [_, algo, fingerprint, iv, ciphertext] = input.split('.')
  if (algo !== 'aesgcm256') {
    throw new Error('Unsupported cipher')
  }
  if (!(fingerprint in keys)) {
    throw new Error('Key is not available')
  }
  const key = keys[fingerprint]
  const aesKey = await expandKey(key, 'decrypt')
  return await decryptAesGcm(aesKey, {
    iv: b64.decode(iv),
    text: b64.decode(ciphertext)
  })
}
