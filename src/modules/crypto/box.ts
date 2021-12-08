import b64 from '@47ng/codec/dist/b64'
import utf8 from '@47ng/codec/dist/utf8'
import { box, BoxKeyPair, randomBytes } from 'tweetnacl'

// --

export interface CryptoBoxKeys {
  public: string
  secret: string
  raw: BoxKeyPair
}

// --

export const publicKeyRegex = /^pk\.([a-zA-Z0-9-_]{43})$/
export const secretKeyRegex = /^sk\.([a-zA-Z0-9-_]{43})$/
export const sealedBoxRegex =
  /^v1\.naclbox\.([a-zA-Z0-9-_]{43}=?)\.utf8\.([a-zA-Z0-9-_]{32})\.([a-zA-Z0-9-_]{22,}={0,2})$/

// --

export function serializePublicKey(key: Uint8Array) {
  return `pk.${b64.encode(key).replace(/\=/g, '')}`
}

export function serializeSecretKey(key: Uint8Array) {
  return `sk.${b64.encode(key).replace(/\=/g, '')}`
}

// --

export function parsePublicKey(key: string): Uint8Array {
  const match = key.match(publicKeyRegex)
  if (!match) {
    throw new Error('Invalid public key format')
  }
  return b64.decode(match[1])
}

export function parseSecretKey(key: string): Uint8Array {
  const match = key.match(secretKeyRegex)
  if (!match) {
    throw new Error('Invalid secret key format')
  }
  return b64.decode(match[1])
}

// --

export function generateKeys(): Readonly<CryptoBoxKeys> {
  const keyPair = box.keyPair()
  return {
    public: serializePublicKey(keyPair.publicKey),
    secret: serializeSecretKey(keyPair.secretKey),
    raw: keyPair
  }
}

export function importKeys(secretKey: string): Readonly<CryptoBoxKeys> {
  const secretKeyBuffer = parseSecretKey(secretKey)
  const keyPair = box.keyPair.fromSecretKey(secretKeyBuffer)
  return {
    public: serializePublicKey(keyPair.publicKey),
    secret: serializeSecretKey(keyPair.secretKey),
    raw: keyPair
  }
}

// --

export function encryptString(input: string, publicKey: Uint8Array) {
  const nonce = randomBytes(box.nonceLength)
  const keyPair = box.keyPair()
  const ciphertext = box(
    utf8.encode(input),
    nonce,
    publicKey,
    keyPair.secretKey
  )
  return [
    'v1',
    'naclbox',
    b64.encode(keyPair.publicKey).replace(/\=/g, ''),
    'utf8',
    b64.encode(nonce).replace(/\=/g, ''),
    b64.encode(ciphertext).replace(/\=/g, '')
  ].join('.')
}

// --

export function decryptString(input: string, secretKey: Uint8Array) {
  const matches = input.match(sealedBoxRegex)
  if (!matches) {
    throw new Error('Unsupported format or algorithm')
  }
  const [publicKey, nonce, ciphertext] = matches.slice(1)

  const message = box.open(
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
