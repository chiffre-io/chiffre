import crypto from 'crypto'
import { hex } from '@47ng/codec'
import { authenticator } from 'otplib'
import { App } from '../types'
import { FastifyRequest } from 'fastify'

function configureAuthenticator() {
  authenticator.options = {
    epoch: Date.now(),
    window: 3 // Allow some periods before and after the current one
  }
}

// --

export function generateTwoFactorSecret() {
  // 20 bytes base32-encoded for compatibility with Google Authenticator
  configureAuthenticator()
  return authenticator.generateSecret(20)
}

export function generateTwoFactorToken(secret: string) {
  configureAuthenticator()
  return authenticator.generate(secret)
}

export function verifyTwoFactorToken(
  token: string,
  secret: string,
  clientTime: number = 0,
  app?: App,
  req?: FastifyRequest
) {
  configureAuthenticator()
  const now = Date.now()
  try {
    req?.log.debug({
      msg: `2FA verification delta`,
      delta: authenticator.checkDelta(token, secret),
      clientTime,
      serverTime: now,
      clockDelta: now - clientTime,
      options: authenticator.options
    })
    return authenticator.check(token, secret)
  } catch (error) {
    req?.log.error({
      msg: 'Failed to verify 2FA token',
      error,
      clientTime,
      serverTime: now,
      clockDelta: now - clientTime
    })
    app?.sentry.report(error)
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
  configureAuthenticator()
  const issuer = 'Chiffre' // todo: Read from environment/config
  const uri = authenticator.keyuri(username, issuer, secret)
  return {
    uri,
    text: secret
  }
}
