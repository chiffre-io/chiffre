import nacl from 'tweetnacl'
import { utf8, b64 } from '@47ng/codec'
import { sha256 } from './utility'
export { sha256 }

// --

interface Keys {
  public: string // base64 encoded
  secret: string // base64 encoded
  fingerprint: string // hex-encoded SHA-256(public key)
  raw: nacl.BoxKeyPair
}

export async function generateKeys(
  secretKey?: string
): Promise<Readonly<Keys>> {
  const keyPair = secretKey
    ? nacl.box.keyPair.fromSecretKey(b64.decode(secretKey))
    : nacl.box.keyPair()
  return {
    public: b64.encode(keyPair.publicKey),
    secret: b64.encode(keyPair.secretKey),
    fingerprint: await sha256(keyPair.publicKey),
    raw: keyPair
  }
}

// --

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
