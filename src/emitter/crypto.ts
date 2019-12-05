import nacl from 'tweetnacl'
import { encodeURLSafe, decodeURLSafe } from '@stablelib/base64'
import { encode as encodeUtf8 } from '@stablelib/utf8'
import { EmitterConfig } from './config'

const expandPublicKey = (key: string): Uint8Array => {
  return decodeURLSafe(key)
}

export const encryptString = (input: string, publicKey: string) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const keyPair = nacl.box.keyPair()
  const ciphertext = nacl.box(
    encodeUtf8(input),
    nonce,
    expandPublicKey(publicKey),
    keyPair.secretKey
  )
  return [
    'v1',
    'naclbox',
    encodeURLSafe(keyPair.publicKey),
    'utf8',
    encodeURLSafe(nonce),
    encodeURLSafe(ciphertext)
  ].join('.')
}

export const encryptMessage = (input: string, config: EmitterConfig) => {
  return encryptString(input, config.publicKey)
}
