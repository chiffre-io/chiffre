import * as NodeCrypto from 'crypto'
import { hex } from '@47ng/codec'

let nodeCrypto: typeof NodeCrypto

if (typeof window === 'undefined') {
  nodeCrypto = require('crypto')
}

export async function sha256(input: Uint8Array): Promise<string> {
  if (typeof window === 'undefined') {
    // Node.js
    const hash = nodeCrypto.createHash('sha256')
    hash.update(input)
    return hash.digest('hex')
  } else {
    // Browser - use WebCrypto
    const hash = await window.crypto.subtle.digest('SHA-256', input)
    return hex.encode(new Uint8Array(hash))
  }
}
