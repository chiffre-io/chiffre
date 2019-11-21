import nacl from 'tweetnacl'
import { b64 } from './codec'

/**
 * Ciphertext data for TweetNaCl box
 * public-key authenticated encryption
 * using x25519-xsalsa20-poly1305.
 */
export interface XCipherText {
  nonce: Uint8Array
  text: Uint8Array
}

export const generateNonce = () => nacl.randomBytes(nacl.box.nonceLength)

export const serializeXCipherText = (cipher: XCipherText): string => {
  return ['x1', b64.encode(cipher.nonce), b64.encode(cipher.text)].join('.')
}

export const deserializeXCipherText = (cipher: string): XCipherText | null => {
  if (cipher.startsWith('x1.')) {
    const [_, nonce, text] = cipher.split('.')
    return {
      nonce: b64.decode(nonce),
      text: b64.decode(text)
    }
  }
  return null
}
