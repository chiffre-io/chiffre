import nacl from 'tweetnacl'
import { utf8, b64 } from '@47ng/codec'
import { EmitterConfig } from './config'

const expandPublicKey = (key: string): Uint8Array => {
  return b64.decode(key)
}

export const encryptString = (input: string, publicKey: string) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const keyPair = nacl.box.keyPair()
  const ciphertext = nacl.box(
    utf8.encode(input),
    nonce,
    expandPublicKey(publicKey),
    keyPair.secretKey
  )
  return [
    'v1',
    'naclbox',
    b64.encode(keyPair.publicKey),
    'utf8',
    b64.encode(nonce),
    b64.encode(ciphertext)
  ].join('.')
}

export const encryptMessage = (input: string, config: EmitterConfig) => {
  return encryptString(input, config.publicKey)
}
