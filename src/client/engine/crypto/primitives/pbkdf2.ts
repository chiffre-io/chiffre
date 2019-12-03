import webcrypto from './webcrypto'
import { b64 } from './codec'

/**
 * Generate a salt for PBKDF2 operations.
 */
export const generateSalt = (): Uint8Array =>
  webcrypto.getRandomValues(new Uint8Array(32))

export const serializeSalt = (salt: Uint8Array) => b64.encode(salt)
export const deserializeSalt = (salt: string) => b64.decode(salt)

/**
 * Derive an AES-GCM key from a password and salt
 * using PBKDF2.
 *
 * @param password Clear text password
 * @param salt Salt used at account creation time
 * @param rounds Number of PBKDF2 rounds. Defaults to 100000.
 */
export const deriveAesGcmKeyFromPassword = async (
  password: string,
  salt: Uint8Array,
  rounds: number = 100000
) => {
  let enc = new TextEncoder()
  const key = await webcrypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return await webcrypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: rounds,
      hash: 'SHA-256'
    },
    key,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

export const pbkdf2DeriveBytes = async (
  password: string,
  salt: Uint8Array,
  length: number,
  hash: 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256',
  rounds: number = 100000
): Promise<Uint8Array> => {
  let enc = new TextEncoder()
  const key = await webcrypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  return new Uint8Array(
    await webcrypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: rounds,
        hash
      },
      key,
      length << 3 // bytes -> bits
    )
  )
}
