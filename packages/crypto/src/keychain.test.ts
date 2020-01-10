import { generateKey } from '@47ng/cloak'
import { createKeychain, lockKeychain, unlockKeychain } from './keychain'

describe('Keychain', () => {
  test('Lock/unlock', async () => {
    const keychain = createKeychain()
    const key = generateKey()
    const locked = await lockKeychain(keychain, key)
    const unlocked = await unlockKeychain(locked, key)
    expect(keychain).toEqual(unlocked)
  })

  test('Locking should not be idempotent', async () => {
    const keychain = createKeychain()
    const key = generateKey()
    const locked1 = await lockKeychain(keychain, key)
    const locked2 = await lockKeychain(keychain, key)
    expect(locked1).not.toEqual(locked2)
  })
})
