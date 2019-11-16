import nacl from 'tweetnacl'
import { b64, utf8 } from './codec'

export interface DataPoint {
  message: string
  nonce: string
  publicKey: string
}

export const decryptDataPoint = (
  dataPoint: DataPoint,
  secretKey: Uint8Array
) => {
  const message = b64.decode(dataPoint.message)
  const nonce = b64.decode(dataPoint.nonce)
  const publicKey = b64.decode(dataPoint.publicKey)
  const deciphered = nacl.box.open(message, nonce, publicKey, secretKey)
  if (!deciphered) {
    return null
  }
  return JSON.parse(utf8.decode(deciphered))
}

export const encryptDataPoint = (
  data: any,
  publicKey: Uint8Array
): DataPoint => {
  const keyPair = nacl.box.keyPair()
  const clearText = utf8.encode(JSON.stringify(data))
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  console.log({ clearText, nonce, publicKey, secretKey: keyPair.secretKey })
  const cipher = nacl.box(clearText, nonce, publicKey, keyPair.secretKey)
  return {
    message: b64.encode(cipher),
    nonce: b64.encode(nonce),
    publicKey: b64.encode(keyPair.publicKey)
  }
}
