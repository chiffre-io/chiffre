import * as NodeCrypto from 'node:crypto'

let nodeCrypto: typeof NodeCrypto

if (typeof window === 'undefined') {
  nodeCrypto = require('crypto')
}

export function generateRandomBytes(length: number) {
  if (typeof window === 'undefined') {
    return nodeCrypto.randomBytes(length)
  } else {
    return window.crypto.getRandomValues(new Uint8Array(length))
  }
}
