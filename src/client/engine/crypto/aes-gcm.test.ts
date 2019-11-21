import nacl from 'tweetnacl'
import webcrypto from '../webcrypto'
import {
  AesCipher,
  serializeAesCipher,
  deserializeAesCipher,
  encryptAesGcm,
  decryptAesGcm
} from './aes-gcm'

describe('WebCrypto AES-GCM', () => {
  test('serde symmetry', () => {
    const expected: AesCipher = {
      text: nacl.randomBytes(42),
      iv: nacl.randomBytes(12)
    }
    const received = deserializeAesCipher(serializeAesCipher(expected))
    expect(received).toEqual(expected)
  })
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
