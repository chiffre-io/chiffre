import {
  generateKey,
  getKeyFingerprint,
  encryptString,
  decryptString
} from './cloaking'

describe('Cloaking', () => {
  test('encrypt/decrypt simple text', async () => {
    const message = 'Hello, world !'
    const key = await generateKey()
    const fingerprint = await getKeyFingerprint(key)
    const cipher = await encryptString(message, key)
    const received = await decryptString(cipher, {
      [fingerprint]: key
    })
    expect(received).toEqual(message)
  })
})
