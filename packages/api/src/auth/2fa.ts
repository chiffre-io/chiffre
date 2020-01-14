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

export function generateTwoFactorSecret() {
  // 20 bytes base32-encoded for compatibility with Google Authenticator
  return authenticator.generateSecret(20)
}

export function generateTwoFactorToken(secret: string) {
  return authenticator.generate(secret)
}

export function verifyTwoFactorToken(token: string, secret: string) {
  try {
    return authenticator.check(token, secret)
  } catch (error) {
    return false
  }
}

export function generateBackupCodes(
  number: number,
  numBytes: number = 16
): string[] {
  return Array(number)
    .fill(undefined)
    .map(() => createRandomBytes(numBytes, KeyEncodings.HEX))
}

export function formatTwoFactorSecret(secret: string, username: string) {
  const issuer = 'Chiffre' // todo: Read from environment/config
  const uri = authenticator.keyuri(username, issuer, secret)
  return {
    uri,
    text: secret
  }
}
