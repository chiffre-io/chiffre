import { generateKey } from '@47ng/cloak'
import { generateSrpSignupEntities } from './srp'
import { createMasterKey, encryptKeychainKey } from './masterKey'
import { createKeychain, lockKeychain } from './keychain'

export async function createSignupEntities(username: string, password: string) {
  // Generate SRP entities
  const srpEntities = await generateSrpSignupEntities(username, password)

  // Create a keychain key & encrypt it with the master key
  const { masterKey, masterSalt, shards } = await createMasterKey(
    username,
    password
  )
  const keychainKey = generateKey()
  const encryptedKeychainKey = await encryptKeychainKey(keychainKey, masterKey)

  const unlockedKeychain = createKeychain()
  const lockedKeychain = await lockKeychain(unlockedKeychain, keychainKey)
  return {
    ...srpEntities,
    masterSalt,
    shards,
    keychainKey: encryptedKeychainKey,
    keychain: {
      ...lockedKeychain
    }
  }
}
