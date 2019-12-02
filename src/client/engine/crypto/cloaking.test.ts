import {
  generateKey,
  encryptString,
  decryptString,
  findKeyForMessage,
  makeKeychain
} from './cloaking'

describe('Cloaking', () => {
  test('encrypt/decrypt simple text', async () => {
    const message = 'Hello, world !'
    const key = await generateKey()
    const cipher = await encryptString(message, key)
    const received = await decryptString(cipher, key)
    expect(received).toEqual(message)
  })
  test('Fingerprinting & keychain', async () => {
    const keyA = await generateKey()
    const keyB = await generateKey()
    const cipherA = await encryptString('Hello', keyA)
    const cipherB = await encryptString('Hello', keyB)
    const keychain = await makeKeychain([keyA, keyB])
    const keyForA = await findKeyForMessage(cipherA, keychain)
    const keyForB = await findKeyForMessage(cipherB, keychain)
    expect(keyForA).toEqual(keyA)
    expect(keyForB).toEqual(keyB)
  })
  test('Fingerprinting & keychain', async () => {
    const keyA = await generateKey()
    const keyB = await generateKey()
    const cipherA = await encryptString('Hello', keyA)
    const cipherB = await encryptString('Hello', keyB)
    const keychain = await makeKeychain([keyA, keyB])
    const keyForA = await findKeyForMessage(cipherA, keychain)
    const keyForB = await findKeyForMessage(cipherB, keychain)
    expect(keyForA).toEqual(keyA)
    expect(keyForB).toEqual(keyB)
  })
})
