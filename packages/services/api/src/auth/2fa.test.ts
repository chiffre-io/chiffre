import {
  generateTwoFactorSecret,
  generateTwoFactorToken,
  verifyTwoFactorToken
} from './2fa'

describe('2FA', () => {
  test('verify valid token', () => {
    const secret = generateTwoFactorSecret()
    const token = generateTwoFactorToken(secret)
    const valid = verifyTwoFactorToken(token, secret)
    expect(valid).toBe(true)
  })

  test('token should still be valid if 1.5 minutes old', () => {
    jest.useFakeTimers()
    const secret = generateTwoFactorSecret()
    const refTime = 1580996249287
    const refDateNow = Date.now
    Date.now = () => refTime
    const token = generateTwoFactorToken(secret)
    Date.now = () => refTime + 1.5 * 60 * 1000
    const valid = verifyTwoFactorToken(token, secret)
    expect(valid).toBe(true)
    Date.now = refDateNow
  })
  test('token should not be valid if 2 minutes old', () => {
    jest.useFakeTimers()
    const secret = generateTwoFactorSecret()
    const refTime = 1580996249287
    const refDateNow = Date.now
    Date.now = () => refTime
    const token = generateTwoFactorToken(secret)
    Date.now = () => refTime + 2 * 60 * 1000
    const valid = verifyTwoFactorToken(token, secret)
    expect(valid).toBe(false)
    Date.now = refDateNow
  })

  test('token should still be valid if 1.5 minutes in the future', () => {
    jest.useFakeTimers()
    const secret = generateTwoFactorSecret()
    const refTime = 1580996249287
    const refDateNow = Date.now
    Date.now = () => refTime
    const token = generateTwoFactorToken(secret)
    Date.now = () => refTime - 1.5 * 60 * 1000
    const valid = verifyTwoFactorToken(token, secret)
    expect(valid).toBe(true)
    Date.now = refDateNow
  })

  test('token should not be valid if 2 minutes in the future', () => {
    jest.useFakeTimers()
    const secret = generateTwoFactorSecret()
    const refTime = 1580996249287
    const refDateNow = Date.now
    Date.now = () => refTime
    const token = generateTwoFactorToken(secret)
    Date.now = () => refTime - 3 * 60 * 1000
    const valid = verifyTwoFactorToken(token, secret)
    expect(valid).toBe(false)
    Date.now = refDateNow
  })
})
