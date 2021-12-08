import { derivePrivateKey } from './srp'

describe('crypto/srp', () => {
  test('derivePrivateKey', async () => {
    const received = await derivePrivateKey(
      'foo.bar@egg.spam',
      'P@ssw0rd!',
      '0919f0aa17875b34564812acd24d58b8859501071334e13f16bb37db917af1e9'
    )
    const expected =
      'bca96fc82c4a56925090670449f8f498ec6624573c2a5fb5cda3d496f0f5d32c'
    expect(received).toEqual(expected)
  })

  test('derivePrivateKey - null input', async () => {
    const received = await derivePrivateKey(
      '',
      '',
      '0000000000000000000000000000000000000000000000000000000000000000'
    )
    const expected =
      'fe0c6a0d17e8edb5c855b0222f3c905372bd8b41045ca9da2dee84b8a78f1cff'
    expect(received).toEqual(expected)
  })
})
