import nacl from 'tweetnacl'
import { utf8, b64 } from '@47ng/codec'
import { sha256 } from './utility'
export { sha256 }

// --

export interface CryptoBoxKeys {
  public: string
  secret: string
  fingerprint: string // hex-encoded SHA-256(public key)
  raw: nacl.BoxKeyPair
}

export function serializePublicKey(key: Uint8Array) {
  return `pk.${b64.encode(key).replace(/\=/g, '')}`
}

export function serializeSecretKey(key: Uint8Array) {
  return `sk.${b64.encode(key).replace(/\=/g, '')}`
}

export function parsePublicKey(key: string): Uint8Array {
  if (!key.startsWith('pk.')) {
    throw new Error('Invalid public key format')
  }
  return b64.decode(key.slice(3))
}

export function parseSecretKey(key: string): nacl.BoxKeyPair {
  if (!key.startsWith('sk.')) {
    throw new Error('Invalid secret key format')
  }
  return nacl.box.keyPair.fromSecretKey(b64.decode(key.slice(3)))
}

// --

export async function generateKeys(
  secretKey?: string
): Promise<Readonly<CryptoBoxKeys>> {
  const keyPair =
    secretKey && secretKey.startsWith('sk.')
      ? parseSecretKey(secretKey)
      : nacl.box.keyPair()
  return {
    public: serializePublicKey(keyPair.publicKey),
    secret: serializeSecretKey(keyPair.secretKey),
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
