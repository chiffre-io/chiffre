import * as NodeCrypto from 'node:crypto'
import { generateRandomBytes } from './webcrypto'

let nodeCrypto: typeof NodeCrypto

if (typeof window === 'undefined') {
  nodeCrypto = require('crypto')
}

/**
 * Generate a salt for PBKDF2 operations.
 */
export function generateSalt(): Uint8Array {
  return generateRandomBytes(32)
}

export async function pbkdf2DeriveBytes(
  password: string,
  salt: Uint8Array,
  length: number,
  hash: 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256',
  rounds: number = 100000
): Promise<Uint8Array> {
  if (typeof window === 'undefined') {
    const digest = hash.toLowerCase().replace('-', '')
    return new Promise((resolve, reject) => {
      nodeCrypto.pbkdf2(
        password,
        salt,
        rounds,
        length,
        digest,
        (err, buffer) => {
          if (err) {
            return reject(err)
          }
          return resolve(new Uint8Array(buffer))
        }
      )
    })
  } else {
    // Browser - use WebCrypto
    let enc = new TextEncoder()
    const key = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )
    return new Uint8Array(
      await window.crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt,
          iterations: rounds,
          hash: {
            name: hash
          }
        },
        key,
        length << 3 // bytes -> bits
      )
    )
  }
}
