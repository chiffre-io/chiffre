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
