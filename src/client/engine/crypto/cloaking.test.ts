import {
  generateKey,
  getKeyFingerprint,
  encryptString,
  decryptString
} from './cloaking'

describe('Cloaking', () => {
  test('foo', async () => {
    const message = 'Hello, world !'
    const key = await generateKey()
    const fingerprint = await getKeyFingerprint(key)
    const cipher = await encryptString(message, key)
    const received = await decryptString(cipher, {
      [fingerprint]: key
    })
    console.log({ key, fingerprint, cipher })
    expect(received).toEqual(message)
  })
})
