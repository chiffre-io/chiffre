import { Authenticator, KeyEncodings } from 'otplib/core'

// Plugins
import { keyDecoder, keyEncoder } from 'otplib/plugin-base32-enc-dec'
import { createDigest, createRandomBytes } from 'otplib/plugin-crypto'

const authenticator = new Authenticator({
  createDigest,
  createRandomBytes,
  keyDecoder,
  keyEncoder
})

export const generateTwoFactorSecret = () => {
  // 20 bytes base32-encoded for compatibility with Google Authenticator
  return authenticator.generateSecret(20)
}

export const generateTwoFactorToken = (secret: string) => {
  return authenticator.generate(secret)
}

export const verifyTwoFactorToken = (token: string, secret: string) => {
  try {
    return authenticator.check(token, secret)
  } catch (error) {
    return false
  }
}

export const generateBackupCodes = (
  number: number,
  numBytes = 16
): string[] => {
  return Array(number)
    .fill(undefined)
    .map(() =>
      createRandomBytes(numBytes, KeyEncodings.HEX)
        .match(/.{1,8}/g)
        .join('-')
    )
}

export const formatTwoFactorSecret = (secret: string, username: string) => {
  const issuer = 'Chiffre' // todo: Read from environment/config
  const uri = authenticator.keyuri(username, issuer, secret)
  return {
    uri,
    text: secret
  }
}
