import { Encoding, encoders, decoders } from '@47ng/codec'
import * as NodeCrypto from 'crypto'

let nodeCrypto: typeof NodeCrypto

if (typeof window === 'undefined') {
  nodeCrypto = require('crypto')
}

export async function hashString(
  input: string,
  inputEncoding: Encoding = 'utf8',
  outputEncoding: Encoding = 'base64'
): Promise<string> {
  const decode = decoders[inputEncoding]
  const encode = encoders[outputEncoding]
  const data = decode(input)
  if (typeof window === 'undefined') {
    const hash = nodeCrypto.createHash('sha256')
    hash.update(data)
    return encode(hash.digest())
  } else {
    const hash = await window.crypto.subtle.digest('SHA-256', data)
    return encode(new Uint8Array(hash))
  }
}
