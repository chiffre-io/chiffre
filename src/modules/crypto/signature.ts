import b64 from '@47ng/codec/dist/b64'
import utf8 from '@47ng/codec/dist/utf8'
import nacl from 'tweetnacl'

// --

export interface SignatureKeys {
  public: string
  secret: string
  raw: nacl.SignKeyPair
}

// --

export const publicKeyRegex = /^spk\.([a-zA-Z0-9-_]{43})$/
export const secretKeyRegex = /^ssk\.([a-zA-Z0-9-_]{86})$/
export const signatureRegex = /^v1\.naclsig\.([a-zA-Z0-9-_]{86,}={0,2})$/

// --

export function serializePublicKey(key: Uint8Array) {
  return `spk.${b64.encode(key).replace(/\=/g, '')}`
}

export function serializeSecretKey(key: Uint8Array) {
  return `ssk.${b64.encode(key).replace(/\=/g, '')}`
}

export function serializeSignature(input: Uint8Array) {
  return `v1.naclsig.${b64.encode(input).replace(/\=/g, '')}`
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

export function parseSignature(sig: string): Uint8Array {
  const match = sig.match(signatureRegex)
  if (!match) {
    throw new Error('Invalid secret key format')
  }
  return b64.decode(match[1])
}

// --

export function generateKeys(): Readonly<SignatureKeys> {
  const keyPair = nacl.sign.keyPair()
  return {
    public: serializePublicKey(keyPair.publicKey),
    secret: serializeSecretKey(keyPair.secretKey),
    raw: keyPair
  }
}

export function importKeys(secretKey: string): Readonly<SignatureKeys> {
  const secretKeyBuffer = parseSecretKey(secretKey)
  const keyPair = nacl.sign.keyPair.fromSecretKey(secretKeyBuffer)
  return {
    public: serializePublicKey(keyPair.publicKey),
    secret: serializeSecretKey(keyPair.secretKey),
    raw: keyPair
  }
}

// --

export function signUtf8String(input: string, secretKey: Uint8Array) {
  return signBuffer(utf8.encode(input), secretKey)
}

export function signBuffer(input: Uint8Array, secretKey: Uint8Array) {
  const sig = nacl.sign(input, secretKey)
  return serializeSignature(sig)
}

// --

export function verifySignature(input: string, publicKey: Uint8Array) {
  const sig = parseSignature(input)
  const msg = nacl.sign.open(sig, publicKey)
  if (msg === null) {
    throw new Error('Failed to verify signature')
  }
  return utf8.decode(msg)
}
