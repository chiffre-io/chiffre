import nacl from 'tweetnacl'
import { utf8, b64 } from '@47ng/codec'

export function encryptString(input: string, publicKey: Uint8Array) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const keyPair = nacl.box.keyPair()
  const ciphertext = nacl.box(
    utf8.encode(input),
    nonce,
    publicKey,
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

// --

export function decryptString(input: string, secretKey: Uint8Array) {
  if (!input.startsWith('v1.naclbox.')) {
    throw new Error('Unsupported format or algorithm')
  }
  const [
    _version,
    _algorithm,
    publicKey,
    encoding,
    nonce,
    ciphertext
  ] = input.split('.')
  if (encoding !== 'utf8') {
    throw new Error(`Unsupported encoding ${encoding} for string`)
  }
  const message = nacl.box.open(
    b64.decode(ciphertext),
    b64.decode(nonce),
    b64.decode(publicKey),
    secretKey
  )
  if (!message) {
    throw new Error('Failed to decrypt message')
  }
  return utf8.decode(message)
}
