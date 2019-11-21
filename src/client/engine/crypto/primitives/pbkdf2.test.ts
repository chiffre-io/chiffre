import {
  generateSalt,
  serializeSalt,
  deserializeSalt,
  deriveAesGcmKeyFromPassword
} from './pbkdf2'
import { encryptAesGcm, decryptAesGcm } from './aes-gcm'

describe('WebCrypto PBKDF2', () => {
  test('salt', () => {
    const expected = generateSalt()
    const received = deserializeSalt(serializeSalt(expected))
    expect(expected).toHaveLength(16)
    expect(received).toEqual(expected)
  })

  describe('deriveAesGcmKeyFromPassword', () => {
    test('same salt & password yield same key', async () => {
      const salt = generateSalt()
      const keyA = await deriveAesGcmKeyFromPassword('P@ssw0rd!', salt)
      const keyB = await deriveAesGcmKeyFromPassword('P@ssw0rd!', salt)
      const message = 'Hello, world !'
      const cipher = await encryptAesGcm(keyA, message)
      const received = await decryptAesGcm(keyB, cipher)
      expect(received).toEqual(message)
    })

    test('different salts (same pw) yield different keys', async () => {
      const saltA = generateSalt()
      const saltB = generateSalt()
      const keyA = await deriveAesGcmKeyFromPassword('P@ssw0rd!', saltA)
      const keyB = await deriveAesGcmKeyFromPassword('P@ssw0rd!', saltB)
      const cipherA = await encryptAesGcm(keyA, 'Hello, World !')
      const cipherB = await encryptAesGcm(keyB, 'Hello, World !')
      await expect(decryptAesGcm(keyB, cipherA)).rejects.toThrow()
      await expect(decryptAesGcm(keyA, cipherB)).rejects.toThrow()
    })

    test('different passwords (same salt) yield different keys', async () => {
      const salt = generateSalt()
      const keyA = await deriveAesGcmKeyFromPassword('P@ssw0rd!', salt)
      const keyB = await deriveAesGcmKeyFromPassword('NotTheSame', salt)
      const cipherA = await encryptAesGcm(keyA, 'Hello, World !')
      const cipherB = await encryptAesGcm(keyB, 'Hello, World !')
      await expect(decryptAesGcm(keyB, cipherA)).rejects.toThrow()
      await expect(decryptAesGcm(keyA, cipherB)).rejects.toThrow()
    })
  })
})
