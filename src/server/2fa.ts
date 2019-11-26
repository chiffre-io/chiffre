import { HOTP, TOTP, Authenticator } from 'otplib/core'

// Plugins
import { keyDecoder, keyEncoder } from 'otplib/plugin-base32-enc-dec'
import { createDigest, createRandomBytes } from 'otplib/plugin-crypto'

// Setup an OTP instance which you need
// const hotp = new HOTP({ createDigest })
// const totp = new TOTP({ createDigest })

const authenticator = new Authenticator({
  createDigest,
  createRandomBytes,
  keyDecoder,
  keyEncoder
})

export const generateTotpSecret = () => {
  return authenticator.generateSecret(32)
}

export const generateTotpToken = (secret: string) => {
  return authenticator.generate(secret)
}

export const verifyTotpToken = (token: string, secret: string) => {
  try {
    return authenticator.check(token, secret)
  } catch (error) {
    return false
  }
}