import { encodeURLSafe, decodeURLSafe } from '@stablelib/base64'
import { encode, decode } from '@stablelib/utf8'

const urlSafe = (str: string) => str.replace(/\+/g, '-').replace(/\//g, '_')

export const b64 = {
  urlSafe,
  encode: encodeURLSafe,
  decode: (base64: string) => decodeURLSafe(urlSafe(base64))
}

export const utf8 = {
  encode,
  decode
}

/**
 * Hex-encoded byte array to base64url representation
 */
export const hexToBase64url = (hex: string) => {
  return b64.encode(Buffer.from(hex, 'hex'))
}

/**
 * Base64url-encoded byte array to hex representation
 */
export const base64ToHex = (base64: string) => {
  return Buffer.from(b64.decode(base64)).toString('hex')
}
