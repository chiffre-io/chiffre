import { Encoding, encoders, decoders } from './codec'
import webcrypto from './webcrypto'

export const hashString = async (
  input: string,
  inputEncoding: Encoding = 'utf8',
  outputEncoding: Encoding = 'base64'
): Promise<string> => {
  const decode = decoders[inputEncoding]
  const encode = encoders[outputEncoding]
  const data = decode(input)
  const hash = await webcrypto.subtle.digest('SHA-256', data)
  return encode(new Uint8Array(hash))
}

export const hashStringRaw = async (
  input: string,
  inputEncoding: Encoding = 'utf8'
) => {
  const decode = decoders[inputEncoding]
  const data = decode(input)
  return new Uint8Array(await webcrypto.subtle.digest('SHA-256', data))
}
