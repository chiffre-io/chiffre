import webcrypto from '../webcrypto'
import { b64, utf8 } from '../codec'

export interface AesCipher {
  text: Uint8Array
  iv: Uint8Array
}

// --

export const serializeAesCipher = (cipher: AesCipher): string => {
  return ['a1', b64.encode(cipher.iv), b64.encode(cipher.text)].join('.')
}

export const deserializeAesCipher = (cipher: string): AesCipher | null => {
  if (cipher.startsWith('a1.')) {
    const [_, iv, text] = cipher.split('.')
    return {
      text: b64.decode(text),
      iv: b64.decode(iv)
    }
  }
  return null
}

// --

export const encryptAesGcm = async (
  key: CryptoKey,
  message: string
): Promise<AesCipher> => {
  const buf = utf8.encode(message)
  const iv = webcrypto.getRandomValues(new Uint8Array(12))
  const cipherText = await webcrypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    buf
  )
  return {
    text: new Uint8Array(cipherText),
    iv
  }
}

export const decryptAesGcm = async (
  key: CryptoKey,
  cipher: AesCipher
): Promise<string> => {
  const buf = await webcrypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: cipher.iv
    },
    key,
    cipher.text
  )
  return utf8.decode(new Uint8Array(buf))
}
