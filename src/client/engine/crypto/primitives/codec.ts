import { encodeURLSafe, decodeURLSafe } from '@stablelib/base64'
import { encode, decode } from '@stablelib/utf8'

export const b64 = {
  encode: encodeURLSafe,
  decode: decodeURLSafe
}

export const utf8 = {
  encode,
  decode
}
