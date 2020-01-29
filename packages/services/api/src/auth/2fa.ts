import crypto from 'crypto'
import { hex } from '@47ng/codec'
import { authenticator } from 'otplib'

// Allow 1 period before and after the current one
authenticator.options = {
  ...authenticator.allOptions(),
  window: 1
}

// --

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
    .map(() => hex.encode(crypto.randomBytes(numBytes)))
}

export function formatTwoFactorSecret(secret: string, username: string) {
  const issuer = 'Chiffre' // todo: Read from environment/config
  const uri = authenticator.keyuri(username, issuer, secret)
  return {
    uri,
    text: secret
  }
}
