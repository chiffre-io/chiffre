import webcrypto from './webcrypto'
import { encryptAesGcm, decryptAesGcm } from './aes-gcm'

describe('WebCrypto AES-GCM', () => {
  test('encrypt/decrypt symmetry', async () => {
    const key = await webcrypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    )
    const expected = 'Hello, world !'
    const cipher = await encryptAesGcm(key, expected)
    const received = await decryptAesGcm(key, cipher)
    expect(received).toEqual(expected)
  })
})
