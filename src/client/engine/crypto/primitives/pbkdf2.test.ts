import {
  generateSalt,
  serializeSalt,
  deserializeSalt,
  deriveAesGcmKeyFromPassword,
  pbkdf2DeriveBytes
} from './pbkdf2'
import { encryptAesGcm, decryptAesGcm } from './aes-gcm'
import { b64 } from './codec'

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

  describe('pbkdf2DeriveBytes', () => {
    test('same salt & password yield same data', async () => {
      const salt = generateSalt()
      const bytesA = await pbkdf2DeriveBytes('P@ssw0rd!', salt, 32)
      const bytesB = await pbkdf2DeriveBytes('P@ssw0rd!', salt, 32)
      expect(b64.encode(bytesA)).toEqual(b64.encode(bytesB))
    })

    test('different salts (same pw) yield different data', async () => {
      const saltA = generateSalt()
      const saltB = generateSalt()
      const bytesA = await pbkdf2DeriveBytes('P@ssw0rd', saltA, 32)
      const bytesB = await pbkdf2DeriveBytes('P@ssw0rd', saltB, 32)
      expect(b64.encode(bytesA)).not.toEqual(b64.encode(bytesB))
    })

    test('different passwords (same salt) yield different keys', async () => {
      const salt = generateSalt()
      const bytesA = await pbkdf2DeriveBytes('P@ssw0rd!', salt, 32)
      const bytesB = await pbkdf2DeriveBytes('NopeNope!', salt, 32)
      expect(b64.encode(bytesA)).not.toEqual(b64.encode(bytesB))
    })
  })
})
