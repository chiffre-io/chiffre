import crypto from 'crypto'
import { hex } from '@47ng/codec'
import { authenticator } from 'otplib'
import { App } from '../types'
import { FastifyRequest } from 'fastify'

// Allow 1 period before and after the current one
authenticator.options = {
  ...authenticator.allOptions(),
  window: 5
}

// --

export function generateTwoFactorSecret() {
  // 20 bytes base32-encoded for compatibility with Google Authenticator
  return authenticator.generateSecret(20)
}

export function generateTwoFactorToken(secret: string) {
  return authenticator.generate(secret)
}

export function verifyTwoFactorToken(
  token: string,
  secret: string,
  clientTime: number,
  app: App,
  req: FastifyRequest
) {
  const now = Date.now()
  try {
    req.log.debug({
      msg: `2FA verification delta`,
      delta: authenticator.checkDelta(token, secret),
      clientTime,
      serverTime: now,
      clockDelta: now - clientTime
    })
    return authenticator.check(token, secret)
  } catch (error) {
    req.log.error({
      msg: 'Failed to verify 2FA token',
      error,
      clientTime,
      serverTime: now,
      clockDelta: now - clientTime
    })
    app.sentry.report(error)
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
